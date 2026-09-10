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
	/// <summary>
	/// Bandeja actores · Requisiciones: solo pendientes con notificación
	/// LOGIN_SISTEMA_DESTINO = login JWT y PROCESADO = 0.
	/// </summary>
	public class SC_BANDEJA_ACTORES_REQUISICIONRepository
		: BaseRepository<SC_BANDEJA_ACTORESTable>, ISC_BANDEJA_ACTORES_REQUISICIONRepository
	{
		private const string _CodigoOpcionRequisicion = "SC_REQUISICION";

		private const string _PendienteExists = @"
EXISTS (
	SELECT 1
	FROM dbo.SEG_FLUJO_INSTANCIA AS I
	INNER JOIN dbo.SEG_FLUJO_TIPO_DOCUMENTO AS TD
		ON TD.CORR_EMPRESA = I.CORR_EMPRESA
	   AND TD.CORR_TIPO_DOCUMENTO = I.CORR_TIPO_DOCUMENTO
	   AND TD.CODIGO_OPCION = N'" + _CodigoOpcionRequisicion + @"'
	INNER JOIN dbo.SEG_FLUJO_NOTIFICACION AS N
		ON N.CORR_EMPRESA = I.CORR_EMPRESA
	   AND N.CORR_INSTANCIA = I.CORR_INSTANCIA
	WHERE I.CORR_EMPRESA = R.CORR_EMPRESA
	  AND I.CORR_DOCUMENTO = R.CORR_REQUISICION_PERSONAL
	  AND I.ACTIVO = 1
	  AND N.LOGIN_SISTEMA_DESTINO = @LOGIN_SISTEMA
	  AND ISNULL(N.PROCESADO, 0) = 0
)";

		private const string _FromRequisicion = @"
FROM dbo.V_SC_REQUISICION_PERSONAL AS R
LEFT JOIN dbo.SEG_USUARIO AS U
	ON U.LOGIN_SISTEMA = R.USUARIO_CREA
OUTER APPLY (
	SELECT TOP (1)
		I.CORR_INSTANCIA,
		N.CORR_NOTIFICACION,
		N.MENSAJE AS MENSAJE_NOTIFICACION,
		N.FECHA_ENVIO AS FECHA_NOTIFICACION,
		N.LOGIN_SISTEMA_ORIGEN AS LOGIN_ORIGEN_NOTIFICACION
	FROM dbo.SEG_FLUJO_INSTANCIA AS I
	INNER JOIN dbo.SEG_FLUJO_TIPO_DOCUMENTO AS TD
		ON TD.CORR_EMPRESA = I.CORR_EMPRESA
	   AND TD.CORR_TIPO_DOCUMENTO = I.CORR_TIPO_DOCUMENTO
	   AND TD.CODIGO_OPCION = N'" + _CodigoOpcionRequisicion + @"'
	INNER JOIN dbo.SEG_FLUJO_NOTIFICACION AS N
		ON N.CORR_EMPRESA = I.CORR_EMPRESA
	   AND N.CORR_INSTANCIA = I.CORR_INSTANCIA
	WHERE I.CORR_EMPRESA = R.CORR_EMPRESA
	  AND I.CORR_DOCUMENTO = R.CORR_REQUISICION_PERSONAL
	  AND I.ACTIVO = 1
	  AND N.LOGIN_SISTEMA_DESTINO = @LOGIN_SISTEMA
	  AND ISNULL(N.PROCESADO, 0) = 0
	ORDER BY N.FECHA_ENVIO DESC, N.CORR_NOTIFICACION DESC
) AS PN";

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
	R.FECHA_ACTU,
	PN.CORR_INSTANCIA,
	PN.CORR_NOTIFICACION,
	PN.MENSAJE_NOTIFICACION,
	PN.FECHA_NOTIFICACION,
	PN.LOGIN_ORIGEN_NOTIFICACION";

		private const string _DefaultSortField = "FECHA_NOTIFICACION";
		private const int _MaxPageSize = 200;

		private static readonly HashSet<string> _AllowedSortFields = new(StringComparer.OrdinalIgnoreCase)
		{
			"CORR_REQUISICION_PERSONAL",
			"FECHA_REQUISICION",
			"FECHA_NOTIFICACION",
			"NOMBRE_PUESTO",
			"NOMBRE_UNIDAD",
			"NOMBRE_SOLICITANTE",
			"CORR_ESTADO_REQUISICION",
			"SALARIO",
			"CANTIDAD_PLAZAS",
			"FECHA_CREA",
		};

		public SC_BANDEJA_ACTORES_REQUISICIONRepository(IConfiguration config)
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
				var login = GetString(xWhere, "LOGIN_SISTEMA")?.Trim() ?? "";
				var corrEstado = GetInt(xWhere, "CORR_ESTADO_REQUISICION");
				var corrUnidad = GetInt(xWhere, "CORR_UNIDAD");
				var fechaDesde = GetDate(xWhere, "FECHA_DESDE");
				var fechaHasta = GetDate(xWhere, "FECHA_HASTA");
				var busqueda = GetString(xWhere, "BUSQUEDA");

				var whereSql = $@"
WHERE R.CORR_EMPRESA = @CORR_EMPRESA
  AND {_PendienteExists}";

				var parameters = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "LOGIN_SISTEMA", Value = login, DbType = DbType.String },
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
						OR ISNULL(PN.MENSAJE_NOTIFICACION, N'') LIKE @BUSQUEDA
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
				var pageData = new List<SC_BANDEJA_ACTORES_REQUISICIONView>().FromDataReader(dataReader).ToList();
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

		public async Task<int> CountRequisicionesPendientesAsync(List<CParameter> xWhere)
		{
			try
			{
				var corrEmpresa = GetInt(xWhere, "CORR_EMPRESA");
				var login = GetString(xWhere, "LOGIN_SISTEMA")?.Trim() ?? "";
				var parameters = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "LOGIN_SISTEMA", Value = login, DbType = DbType.String },
				};

				var sql = $@"
SELECT COUNT(1) AS TOTAL_ROWS
FROM dbo.V_SC_REQUISICION_PERSONAL AS R
WHERE R.CORR_EMPRESA = @CORR_EMPRESA
  AND {_PendienteExists}";

				var reader = await objData.GetDataReader(CommandType.Text, sql, parameters);
				var total = 0;
				if (reader.Read())
				{
					total = Convert.ToInt32(reader["TOTAL_ROWS"]);
				}
				reader.Close();
				return total;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		public async Task<CResult> GetUnidadesPendientesAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();
			try
			{
				var corrEmpresa = GetInt(xWhere, "CORR_EMPRESA");
				var login = GetString(xWhere, "LOGIN_SISTEMA")?.Trim() ?? "";
				var parameters = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "LOGIN_SISTEMA", Value = login, DbType = DbType.String },
				};

				var sql = $@"
SELECT DISTINCT CORR_UNIDAD, NOMBRE_UNIDAD
FROM (
	SELECT
		R.CORR_UNIDAD,
		CAST(R.NOMBRE_UNIDAD AS NVARCHAR(200)) AS NOMBRE_UNIDAD
	FROM dbo.V_SC_REQUISICION_PERSONAL AS R
	WHERE R.CORR_EMPRESA = @CORR_EMPRESA
	  AND {_PendienteExists}

	UNION

	SELECT
		R.CORR_UNIDAD,
		CAST(R.NOMBRE_UNIDAD AS NVARCHAR(200)) AS NOMBRE_UNIDAD
	FROM dbo.SC_SOLICITUD_EMPLEO AS S
	INNER JOIN dbo.SC_SOLICITUD_REQUISICION AS SR
		ON SR.CORR_EMPRESA = S.CORR_EMPRESA
	   AND SR.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
	INNER JOIN dbo.V_SC_REQUISICION_PERSONAL AS R
		ON R.CORR_EMPRESA = SR.CORR_EMPRESA
	   AND R.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
	INNER JOIN dbo.SC_EXPEDIENTE_SOLICITUD AS ES
		ON ES.CORR_EMPRESA = S.CORR_EMPRESA
	   AND ES.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
	INNER JOIN dbo.SC_EXPEDIENTE_CANDIDATO AS E
		ON E.CORR_EMPRESA = ES.CORR_EMPRESA
	   AND E.CORR_EXPEDIENTE_CANDIDATO = ES.CORR_EXPEDIENTE_CANDIDATO
	LEFT JOIN dbo.SC_REQUISICION_CANDIDATO AS RC
		ON RC.CORR_EMPRESA = SR.CORR_EMPRESA
	   AND RC.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
	   AND RC.CORR_EXPEDIENTE_CANDIDATO = ES.CORR_EXPEDIENTE_CANDIDATO
	   AND RC.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
	WHERE S.CORR_EMPRESA = @CORR_EMPRESA
	  AND S.ACTIVO = 1
	  AND S.CORR_PERSONA_DATOS IS NOT NULL
	  AND S.CORR_PERSONA_DATOS > 0
	  AND ISNULL(E.CORR_ESTADO_EXPEDIENTE, 0) = 2
	  AND ISNULL(RC.ESTADO_DECISION, N'PENDIENTE') = N'PENDIENTE'
	  AND EXISTS (
			SELECT 1
			FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES AS J
			INNER JOIN dbo.GEN_EMPLEADO AS GE
				ON GE.CORR_EMPRESA = J.CORR_EMPRESA
			   AND GE.CORR_EMPLEADO = J.CORR_EMPLEADO
			WHERE J.CORR_EMPRESA = R.CORR_EMPRESA
			  AND J.CORR_UNIDAD = R.CORR_UNIDAD
			  AND J.ACTIVO = 1
			  AND (J.FECHA_FIN IS NULL OR J.FECHA_FIN >= CAST(GETDATE() AS DATE))
			  AND GE.ESTADO_EMPLEADO = N'1'
			  AND (
					LTRIM(RTRIM(ISNULL(GE.LOGIN_SISTEMA, N''))) = @LOGIN_SISTEMA
					OR LTRIM(RTRIM(ISNULL(GE.LOGIN_SISTEMA_WEB, N''))) = @LOGIN_SISTEMA
			  )
	  )
) AS X
ORDER BY NOMBRE_UNIDAD";

				var reader = await objData.GetDataReader(CommandType.Text, sql, parameters);
				var rows = new List<SC_BANDEJA_ACTORES_UNIDADView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = rows;
				objResultado.Result = true;
				objResultado.RowsAffected = rows.Count;
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

				var response = new List<SC_BANDEJA_ACTORES_BITACORAView>().FromDataReader(reader).ToList();
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

			if (string.Equals(sortField, "FECHA_NOTIFICACION", StringComparison.OrdinalIgnoreCase))
			{
				return $"PN.FECHA_NOTIFICACION {sortDir}, R.CORR_REQUISICION_PERSONAL {sortDir}";
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

			return DateTime.TryParse(p.Value.ToString(), out var parsed) ? parsed : null;
		}
	}
}
