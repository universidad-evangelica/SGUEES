using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public class SC_BANDEJA_TH_REQUISICIONRepository : BaseRepository<SC_BANDEJA_THTable>, ISC_BANDEJA_TH_REQUISICIONRepository
	{
		/// <summary>
		/// Fuente operativa: vista existente + join a SEG_USUARIO.
		/// (V_SC_BANDEJA_REQUISICION es opcional; script en SGUEES-DB/Views).
		/// </summary>
		private const string _FromRequisicion = @"
FROM dbo.V_SC_REQUISICION_PERSONAL AS R
LEFT JOIN dbo.SEG_USUARIO AS U
	ON U.LOGIN_SISTEMA = R.USUARIO_CREA";

		private const string _SelectRequisicion = @"
SELECT
	R.CORR_EMPRESA,
	R.CORR_REQUISICION_PERSONAL,
	R.CORR_DESCRIPTOR_PUESTO,
	R.CORR_UNIDAD,
	R.NOMBRE_UNIDAD,
	R.CORR_PUESTO,
	R.NOMBRE_PUESTO,
	R.CORR_TIPO_MODALIDAD,
	R.MODALIDAD_NOMBRE,
	R.CORR_TIPO_CONTRATACION,
	R.NOMBRE_TIPO_CONTRATACION,
	R.CORR_TIPO_VACANTE,
	R.NOMBRE_TIPO_VACANTE,
	R.CANTIDAD_PLAZAS,
	R.PLAZAS_CUBIERTAS,
	R.FECHA_REQUISICION,
	R.JUSTIFICACION,
	R.CORR_EMPLEADO_SUSTITUTO,
	R.SALARIO,
	R.CORR_ESTADO_REQUISICION,
	R.FECHA_APROBACION,
	R.FECHA_CIERRE,
	R.TIEMPO_CONTRATO,
	R.HORARIO,
	R.USUARIO_CREA,
	CAST(ISNULL(U.NOMBRE_USUARIO, R.USUARIO_CREA) AS NVARCHAR(120)) AS NOMBRE_SOLICITANTE,
	R.ESTACION_CREA,
	R.FECHA_CREA,
	R.USUARIO_ACTU,
	R.ESTACION_ACTU,
	R.FECHA_ACTU";

		private const string _DefaultSortField = "FECHA_REQUISICION";
		private const int _MaxPageSize = 200;

		private static readonly HashSet<string> _AllowedSortFields = new(StringComparer.OrdinalIgnoreCase)
		{
			"CORR_REQUISICION_PERSONAL",
			"FECHA_REQUISICION",
			"NOMBRE_PUESTO",
			"NOMBRE_UNIDAD",
			"NOMBRE_SOLICITANTE",
			"CORR_ESTADO_REQUISICION",
			"SALARIO",
			"CANTIDAD_PLAZAS",
			"FECHA_CREA",
		};

		public SC_BANDEJA_TH_REQUISICIONRepository(IConfiguration config)
			: base(
				config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetRequisicionesPagedAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var paging = CPagingParameters.Parse(xWhere, _MaxPageSize);
				var sortField = ResolveSortField(paging.SortField);
				var sortDir = paging.SortDesc ? "DESC" : "ASC";
				var orderBySql = BuildOrderBy(sortField, sortDir);

				var corrEmpresa = GetInt(xWhere, "CORR_EMPRESA");
				var corrEstado = GetInt(xWhere, "CORR_ESTADO_REQUISICION");
				var corrUnidad = GetInt(xWhere, "CORR_UNIDAD");
				var fechaDesde = GetDate(xWhere, "FECHA_DESDE");
				var fechaHasta = GetDate(xWhere, "FECHA_HASTA");
				var busqueda = GetString(xWhere, "BUSQUEDA");

				var whereSql = "WHERE R.CORR_EMPRESA = @CORR_EMPRESA";
				var parameters = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
				};

				if (corrEstado > 0)
				{
					whereSql += " AND R.CORR_ESTADO_REQUISICION = @CORR_ESTADO_REQUISICION";
					parameters.Add(new CParameter
					{
						ParameterName = "CORR_ESTADO_REQUISICION",
						Value = corrEstado,
						DbType = DbType.Int32,
					});
				}

				if (corrUnidad > 0)
				{
					whereSql += " AND R.CORR_UNIDAD = @CORR_UNIDAD";
					parameters.Add(new CParameter
					{
						ParameterName = "CORR_UNIDAD",
						Value = corrUnidad,
						DbType = DbType.Int32,
					});
				}

				if (fechaDesde.HasValue)
				{
					whereSql += " AND R.FECHA_REQUISICION >= @FECHA_DESDE";
					parameters.Add(new CParameter
					{
						ParameterName = "FECHA_DESDE",
						Value = fechaDesde.Value.Date,
						DbType = DbType.Date,
					});
				}

				if (fechaHasta.HasValue)
				{
					whereSql += " AND R.FECHA_REQUISICION <= @FECHA_HASTA";
					parameters.Add(new CParameter
					{
						ParameterName = "FECHA_HASTA",
						Value = fechaHasta.Value.Date,
						DbType = DbType.Date,
					});
				}

				if (!string.IsNullOrWhiteSpace(busqueda))
				{
					whereSql += @" AND (
						CAST(R.CORR_REQUISICION_PERSONAL AS VARCHAR(30)) LIKE @BUSQUEDA
						OR R.NOMBRE_PUESTO LIKE @BUSQUEDA
						OR R.NOMBRE_UNIDAD LIKE @BUSQUEDA
						OR R.USUARIO_CREA LIKE @BUSQUEDA
						OR ISNULL(U.NOMBRE_USUARIO, R.USUARIO_CREA) LIKE @BUSQUEDA
						OR R.JUSTIFICACION LIKE @BUSQUEDA
						OR R.NOMBRE_TIPO_CONTRATACION LIKE @BUSQUEDA
						OR R.MODALIDAD_NOMBRE LIKE @BUSQUEDA
					)";
					parameters.Add(new CParameter
					{
						ParameterName = "BUSQUEDA",
						Value = "%" + busqueda.Trim() + "%",
						DbType = DbType.String,
					});
				}

				var countSql = $@"
SELECT COUNT(1) AS TOTAL_ROWS
{_FromRequisicion}
{whereSql}";

				var countReader = await objData.GetDataReader(CommandType.Text, countSql, parameters);
				var totalRows = 0;
				if (countReader.Read())
				{
					totalRows = Convert.ToInt32(countReader["TOTAL_ROWS"]);
				}
				countReader.Close();

				string dataSql;
				if (paging.ReturnAll)
				{
					dataSql = $@"
{_SelectRequisicion}
{_FromRequisicion}
{whereSql}
ORDER BY {orderBySql}";
				}
				else
				{
					dataSql = $@"
{_SelectRequisicion}
{_FromRequisicion}
{whereSql}
ORDER BY {orderBySql}
OFFSET @OFFSET ROWS FETCH NEXT @PAGE_SIZE ROWS ONLY";
					parameters.Add(new CParameter
					{
						ParameterName = "OFFSET",
						Value = paging.Offset,
						DbType = DbType.Int32,
					});
					parameters.Add(new CParameter
					{
						ParameterName = "PAGE_SIZE",
						Value = paging.PageSize,
						DbType = DbType.Int32,
					});
				}

				var dataReader = await objData.GetDataReader(CommandType.Text, dataSql, parameters);
				var pageData = new List<SC_BANDEJA_TH_REQUISICIONView>().FromDataReader(dataReader).ToList();
				dataReader.Close();

				objResultado.Data = pageData;
				objResultado.Result = true;
				objResultado.RowsAffected = totalRows;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> GetBitacoraRequisicionAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT
	FB.CORR_EMPRESA,
	FB.CORR_DOCUMENTO,
	FB.LOGIN_SISTEMA,
	FB.ESTADO_ORIGEN,
	FB.ESTADO_DESTINO,
	FB.NOMBRE_PASO,
	FB.COMENTARIO,
	FB.FECHA_ACCION
FROM V_SEG_FLUJO_BITACORA_FIRMAS FB
WHERE FB.CORR_TIPO_DOCUMENTO = @CORR_TIPO_DOCUMENTO
  AND FB.CORR_DOCUMENTO = @CORR_DOCUMENTO
ORDER BY FB.FECHA_ACCION DESC, FB.CORR_BITACORA DESC", xWhere);

				var response = new List<SC_BANDEJA_TH_BITACORAView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private static string ResolveSortField(string requested)
		{
			if (!string.IsNullOrWhiteSpace(requested) && _AllowedSortFields.Contains(requested.Trim()))
			{
				return requested.Trim();
			}

			return _DefaultSortField;
		}

		private static string BuildOrderBy(string sortField, string sortDir)
		{
			if (string.Equals(sortField, "NOMBRE_SOLICITANTE", StringComparison.OrdinalIgnoreCase))
			{
				return $"ISNULL(U.NOMBRE_USUARIO, R.USUARIO_CREA) {sortDir}";
			}

			return $"R.[{sortField}] {sortDir}";
		}

		private static int GetInt(List<CParameter> xWhere, string name)
		{
			var p = xWhere?.FirstOrDefault(x =>
				string.Equals(x.ParameterName, name, StringComparison.OrdinalIgnoreCase));
			if (p?.Value == null || p.Value == DBNull.Value)
			{
				return 0;
			}

			return Convert.ToInt32(p.Value);
		}

		private static string GetString(List<CParameter> xWhere, string name)
		{
			var p = xWhere?.FirstOrDefault(x =>
				string.Equals(x.ParameterName, name, StringComparison.OrdinalIgnoreCase));
			return p?.Value?.ToString();
		}

		private static DateTime? GetDate(List<CParameter> xWhere, string name)
		{
			var p = xWhere?.FirstOrDefault(x =>
				string.Equals(x.ParameterName, name, StringComparison.OrdinalIgnoreCase));
			if (p?.Value == null || p.Value == DBNull.Value)
			{
				return null;
			}

			if (p.Value is DateTime dt)
			{
				return dt;
			}

			if (DateTime.TryParse(p.Value.ToString(), out var parsed))
			{
				return parsed;
			}

			return null;
		}
	}
}

