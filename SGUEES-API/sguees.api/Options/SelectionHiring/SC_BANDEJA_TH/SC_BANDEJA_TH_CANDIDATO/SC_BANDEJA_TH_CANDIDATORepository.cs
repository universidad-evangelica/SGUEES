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
	public class SC_BANDEJA_TH_CANDIDATORepository : BaseRepository<SC_BANDEJA_THTable>, ISC_BANDEJA_TH_CANDIDATORepository
	{
		/// <summary>
		/// Postulación = solicitud con persona + requisición vinculada.
		/// Estado derivado: POSTULANTE → CON_EXPEDIENTE → EN_SELECCION → APLICA/NO_APLICA.
		/// </summary>
		private const string _EstadoCicloExpr = @"
CAST(CASE
	WHEN ES.CORR_EXPEDIENTE_CANDIDATO IS NULL THEN N'POSTULANTE'
	WHEN RC.ESTADO_DECISION = N'APLICA' THEN N'APLICA'
	WHEN RC.ESTADO_DECISION = N'NO_APLICA' THEN N'NO_APLICA'
	WHEN ISNULL(E.CORR_ESTADO_EXPEDIENTE, 0) = 2 THEN N'EN_SELECCION'
	ELSE N'CON_EXPEDIENTE'
END AS VARCHAR(20))";

		private const string _FromCandidato = @"
FROM dbo.SC_SOLICITUD_EMPLEO AS S
INNER JOIN dbo.SC_SOLICITUD_REQUISICION AS SR
	ON SR.CORR_EMPRESA = S.CORR_EMPRESA
   AND SR.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
INNER JOIN dbo.V_SC_REQUISICION_PERSONAL AS R
	ON R.CORR_EMPRESA = SR.CORR_EMPRESA
   AND R.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
LEFT JOIN dbo.SC_EXPEDIENTE_SOLICITUD AS ES
	ON ES.CORR_EMPRESA = S.CORR_EMPRESA
   AND ES.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
LEFT JOIN dbo.SC_EXPEDIENTE_CANDIDATO AS E
	ON E.CORR_EMPRESA = ES.CORR_EMPRESA
   AND E.CORR_EXPEDIENTE_CANDIDATO = ES.CORR_EXPEDIENTE_CANDIDATO
LEFT JOIN dbo.V_SC_EXPEDIENTE_CANDIDATO AS EC
	ON EC.CORR_EMPRESA = E.CORR_EMPRESA
   AND EC.CORR_EXPEDIENTE_CANDIDATO = E.CORR_EXPEDIENTE_CANDIDATO
LEFT JOIN dbo.SC_REQUISICION_CANDIDATO AS RC
	ON RC.CORR_EMPRESA = SR.CORR_EMPRESA
   AND RC.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
   AND RC.CORR_EXPEDIENTE_CANDIDATO = ES.CORR_EXPEDIENTE_CANDIDATO
   AND RC.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
LEFT JOIN dbo.SEG_USUARIO AS U
	ON U.LOGIN_SISTEMA = R.USUARIO_CREA
OUTER APPLY (
	SELECT TOP (1)
		CONVERT(varchar(10), X.FECHA_ENTREVISTA, 103)
			+ N' — '
			+ ISNULL(NULLIF(LTRIM(RTRIM(X.RESULTADO_ENTREVISTA)), N''), X.ESTADO_ENTREVISTA)
			AS ULTIMA_ENTREVISTA
	FROM dbo.SC_EXPEDIENTE_ENTREVISTA AS X
	WHERE X.CORR_EMPRESA = S.CORR_EMPRESA
	  AND X.CORR_EXPEDIENTE_CANDIDATO = ES.CORR_EXPEDIENTE_CANDIDATO
	  AND X.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
	  AND X.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
	ORDER BY X.FECHA_ENTREVISTA DESC, X.CORR_EXPEDIENTE_ENTREVISTA DESC
) AS UE";

		private const string _SelectCandidato = @"
SELECT
	S.CORR_EMPRESA,
	S.CORR_SOLICITUD_EMPLEO,
	SR.CORR_REQUISICION_PERSONAL,
	S.CORR_PERSONA_DATOS,
	ES.CORR_EXPEDIENTE_CANDIDATO,
	E.CORR_ESTADO_EXPEDIENTE,
	" + _EstadoCicloExpr + @" AS ESTADO_CICLO_CANDIDATO,
	CAST(ISNULL(RC.ESTADO_DECISION, N'PENDIENTE') AS VARCHAR(20)) AS ESTADO_DECISION,
	RC.OBSERVACION_DECISION,
	RC.FECHA_DECISION,
	S.FECHA_GENERACION,
	CAST(ISNULL(EC.NOMBRE_PERSONA, S.NOMBRE) AS NVARCHAR(250)) AS NOMBRE_PERSONA,
	CAST(ISNULL(EC.DUI_PERSONA, S.DUI) AS NVARCHAR(25)) AS DUI_PERSONA,
	R.NOMBRE_UNIDAD,
	R.NOMBRE_PUESTO,
	R.MODALIDAD_NOMBRE,
	R.NOMBRE_TIPO_CONTRATACION,
	R.CORR_ESTADO_REQUISICION,
	R.SALARIO,
	R.HORARIO,
	R.TIEMPO_CONTRATO,
	R.USUARIO_CREA AS USUARIO_SOLICITANTE_REQ,
	CAST(ISNULL(U.NOMBRE_USUARIO, R.USUARIO_CREA) AS NVARCHAR(120)) AS NOMBRE_SOLICITANTE,
	(
		SELECT COUNT(1)
		FROM dbo.SC_EXPEDIENTE_ENTREVISTA AS X
		WHERE X.CORR_EMPRESA = S.CORR_EMPRESA
		  AND X.CORR_EXPEDIENTE_CANDIDATO = ES.CORR_EXPEDIENTE_CANDIDATO
		  AND X.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
		  AND X.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
	) AS CANTIDAD_ENTREVISTAS,
	UE.ULTIMA_ENTREVISTA";

		private const string _DefaultSortField = "FECHA_GENERACION";
		private const int _MaxPageSize = 200;

		private static readonly HashSet<string> _AllowedSortFields = new(StringComparer.OrdinalIgnoreCase)
		{
			"FECHA_GENERACION",
			"NOMBRE_PERSONA",
			"DUI_PERSONA",
			"NOMBRE_PUESTO",
			"NOMBRE_UNIDAD",
			"NOMBRE_SOLICITANTE",
			"ESTADO_CICLO_CANDIDATO",
			"CORR_SOLICITUD_EMPLEO",
			"CORR_REQUISICION_PERSONAL",
			"CORR_EXPEDIENTE_CANDIDATO",
		};

		private static readonly HashSet<string> _AllowedCiclo = new(StringComparer.OrdinalIgnoreCase)
		{
			"POSTULANTE",
			"CON_EXPEDIENTE",
			"EN_SELECCION",
			"APLICA",
			"NO_APLICA",
		};

		public SC_BANDEJA_TH_CANDIDATORepository(IConfiguration config)
			: base(
				config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetCandidatosPagedAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var paging = CPagingParameters.Parse(xWhere, _MaxPageSize);
				var sortField = ResolveSortField(paging.SortField);
				var sortDir = paging.SortDesc ? "DESC" : "ASC";
				var orderBySql = BuildOrderBy(sortField, sortDir);

				var corrEmpresa = GetInt(xWhere, "CORR_EMPRESA");
				var estadoCiclo = GetString(xWhere, "ESTADO_CICLO");
				var nombreUnidad = GetString(xWhere, "NOMBRE_UNIDAD");
				var fechaDesde = GetDate(xWhere, "FECHA_DESDE");
				var fechaHasta = GetDate(xWhere, "FECHA_HASTA");
				var busqueda = GetString(xWhere, "BUSQUEDA");

				var whereSql = @"
WHERE S.CORR_EMPRESA = @CORR_EMPRESA
  AND S.ACTIVO = 1
  AND S.CORR_PERSONA_DATOS IS NOT NULL
  AND S.CORR_PERSONA_DATOS > 0";

				var parameters = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
				};

				if (!string.IsNullOrWhiteSpace(estadoCiclo) && _AllowedCiclo.Contains(estadoCiclo.Trim()))
				{
					whereSql += $" AND {_EstadoCicloExpr} = @ESTADO_CICLO";
					parameters.Add(new CParameter
					{
						ParameterName = "ESTADO_CICLO",
						Value = estadoCiclo.Trim().ToUpperInvariant(),
						DbType = DbType.String,
					});
				}

				if (!string.IsNullOrWhiteSpace(nombreUnidad))
				{
					whereSql += " AND R.NOMBRE_UNIDAD = @NOMBRE_UNIDAD";
					parameters.Add(new CParameter
					{
						ParameterName = "NOMBRE_UNIDAD",
						Value = nombreUnidad.Trim(),
						DbType = DbType.String,
					});
				}

				if (fechaDesde.HasValue)
				{
					whereSql += " AND S.FECHA_GENERACION >= @FECHA_DESDE";
					parameters.Add(new CParameter
					{
						ParameterName = "FECHA_DESDE",
						Value = fechaDesde.Value.Date,
						DbType = DbType.Date,
					});
				}

				if (fechaHasta.HasValue)
				{
					whereSql += " AND S.FECHA_GENERACION <= @FECHA_HASTA";
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
						CAST(S.CORR_SOLICITUD_EMPLEO AS VARCHAR(30)) LIKE @BUSQUEDA
						OR CAST(SR.CORR_REQUISICION_PERSONAL AS VARCHAR(30)) LIKE @BUSQUEDA
						OR CAST(ISNULL(ES.CORR_EXPEDIENTE_CANDIDATO, 0) AS VARCHAR(30)) LIKE @BUSQUEDA
						OR ISNULL(EC.NOMBRE_PERSONA, S.NOMBRE) LIKE @BUSQUEDA
						OR ISNULL(EC.DUI_PERSONA, S.DUI) LIKE @BUSQUEDA
						OR R.NOMBRE_PUESTO LIKE @BUSQUEDA
						OR R.NOMBRE_UNIDAD LIKE @BUSQUEDA
						OR ISNULL(U.NOMBRE_USUARIO, R.USUARIO_CREA) LIKE @BUSQUEDA
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
{_FromCandidato}
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
{_SelectCandidato}
{_FromCandidato}
{whereSql}
ORDER BY {orderBySql}";
				}
				else
				{
					dataSql = $@"
{_SelectCandidato}
{_FromCandidato}
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
				var pageData = new List<SC_BANDEJA_TH_CANDIDATOView>().FromDataReader(dataReader).ToList();
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
			if (string.Equals(sortField, "ESTADO_CICLO_CANDIDATO", StringComparison.OrdinalIgnoreCase))
			{
				return $"{_EstadoCicloExpr} {sortDir}";
			}

			if (string.Equals(sortField, "NOMBRE_PERSONA", StringComparison.OrdinalIgnoreCase))
			{
				return $"ISNULL(EC.NOMBRE_PERSONA, S.NOMBRE) {sortDir}";
			}

			if (string.Equals(sortField, "DUI_PERSONA", StringComparison.OrdinalIgnoreCase))
			{
				return $"ISNULL(EC.DUI_PERSONA, S.DUI) {sortDir}";
			}

			if (string.Equals(sortField, "NOMBRE_SOLICITANTE", StringComparison.OrdinalIgnoreCase))
			{
				return $"ISNULL(U.NOMBRE_USUARIO, R.USUARIO_CREA) {sortDir}";
			}

			if (string.Equals(sortField, "NOMBRE_PUESTO", StringComparison.OrdinalIgnoreCase)
				|| string.Equals(sortField, "NOMBRE_UNIDAD", StringComparison.OrdinalIgnoreCase))
			{
				return $"R.[{sortField}] {sortDir}";
			}

			if (string.Equals(sortField, "CORR_REQUISICION_PERSONAL", StringComparison.OrdinalIgnoreCase))
			{
				return $"SR.[{sortField}] {sortDir}";
			}

			if (string.Equals(sortField, "CORR_EXPEDIENTE_CANDIDATO", StringComparison.OrdinalIgnoreCase))
			{
				return $"ES.[{sortField}] {sortDir}";
			}

			return $"S.[{sortField}] {sortDir}";
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
