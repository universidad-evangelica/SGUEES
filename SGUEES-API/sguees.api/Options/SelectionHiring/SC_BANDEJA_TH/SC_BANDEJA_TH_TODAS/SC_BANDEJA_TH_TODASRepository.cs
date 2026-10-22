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
	// Qué hace: Repositorio para la pestaña Todas de la Bandeja TH que consulta Requisiciones, Candidatos y Contrataciones.
	// Cómo lo hace: Ejecuta un UNION ALL paginado con OFFSET/FETCH aplicando filtros comunes de empresa, tipo, unidad, fechas y texto.
	public class SC_BANDEJA_TH_TODASRepository : BaseRepository<SC_BANDEJA_THTable>, ISC_BANDEJA_TH_TODASRepository
	{
		private const int _MaxPageSize = 200;

		public SC_BANDEJA_TH_TODASRepository(IConfiguration config)
			: base(
				config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Qué hace: Consulta paginada y consolidada de los tres stages de la Bandeja TH.
		// Cómo lo hace: Realiza un UNION ALL de Requisiciones, Candidatos y Contrataciones en un subquery y aplica filtros y paginación en SQL Server.
		public async Task<CResult> GetTodasPagedAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var paging = CPagingParameters.Parse(xWhere, _MaxPageSize);
				var sortField = ResolveSortField(paging.SortField);
				var sortDir = paging.SortDesc ? "DESC" : "ASC";
				var orderBySql = BuildOrderBy(sortField, sortDir);
				var corrEmpresa = GetInt(xWhere, "CORR_EMPRESA");
				var tipo = GetString(xWhere, "TIPO");
				var nombreUnidad = GetString(xWhere, "NOMBRE_UNIDAD");
				var fechaDesde = GetDate(xWhere, "FECHA_DESDE");
				var fechaHasta = GetDate(xWhere, "FECHA_HASTA");
				var busqueda = GetString(xWhere, "BUSQUEDA");
				var estado = GetString(xWhere, "ESTADO");

				var baseUnionSql = @"
FROM (
	-- 1. Requisiciones
	SELECT
		CAST('REQUISICION' AS VARCHAR(20)) AS TIPO,
		CAST(R.CORR_EMPRESA AS INT) AS CORR_EMPRESA,
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
		CAST(NULL AS INT) AS CORR_SOLICITUD_EMPLEO,
		CAST(NULL AS INT) AS CORR_PERSONA_DATOS,
		CAST(NULL AS INT) AS CORR_EXPEDIENTE_CANDIDATO,
		CAST(NULL AS INT) AS CORR_ESTADO_EXPEDIENTE,
		CAST(NULL AS VARCHAR(20)) AS ESTADO_CICLO_CANDIDATO,
		CAST(NULL AS VARCHAR(20)) AS ESTADO_DECISION,
		CAST(NULL AS NVARCHAR(MAX)) AS OBSERVACION_DECISION,
		CAST(NULL AS DATETIME) AS FECHA_DECISION,
		CAST(NULL AS DATETIME) AS FECHA_GENERACION,
		CAST(NULL AS NVARCHAR(250)) AS NOMBRE_PERSONA,
		CAST(NULL AS NVARCHAR(25)) AS DUI_PERSONA,
		CAST(NULL AS VARCHAR(30)) AS USUARIO_SOLICITANTE_REQ,
		CAST(0 AS INT) AS CANTIDAD_ENTREVISTAS,
		CAST(NULL AS NVARCHAR(200)) AS ULTIMA_ENTREVISTA,
		CAST(NULL AS INT) AS CORR_REQUISICION_CANDIDATO,
		CAST(NULL AS INT) AS CORR_MOVIMIENTO_PERSONAL,
		CAST(NULL AS VARCHAR(10)) AS ESTADO_MOVIMIENTO,
		CAST(NULL AS BIT) AS CONFIRMADO,
		CAST(NULL AS INT) AS CORR_EMPLEADO,
		CAST(NULL AS DATETIME) AS FECHA_EFECTIVA,
		R.FECHA_REQUISICION AS FECHA_ORDEN
	FROM dbo.V_SC_REQUISICION_PERSONAL AS R
	LEFT JOIN dbo.SEG_USUARIO AS U ON U.LOGIN_SISTEMA = R.USUARIO_CREA
	WHERE R.CORR_EMPRESA = @CORR_EMPRESA

	UNION ALL

	-- 2. Candidatos
	SELECT
		CAST('CANDIDATO' AS VARCHAR(20)) AS TIPO,
		CAST(S.CORR_EMPRESA AS INT) AS CORR_EMPRESA,
		SR.CORR_REQUISICION_PERSONAL,
		CAST(NULL AS INT) AS CORR_DESCRIPTOR_PUESTO,
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
		S.ESTACION_CREA,
		S.FECHA_CREA,
		S.USUARIO_ACTU,
		S.ESTACION_ACTU,
		S.FECHA_ACTU,
		S.CORR_SOLICITUD_EMPLEO,
		S.CORR_PERSONA_DATOS,
		ES.CORR_EXPEDIENTE_CANDIDATO,
		E.CORR_ESTADO_EXPEDIENTE,
		CAST(CASE
			WHEN ES.CORR_EXPEDIENTE_CANDIDATO IS NULL THEN N'POSTULANTE'
			WHEN RC.ESTADO_DECISION = N'NO_APLICA' THEN N'NO_APLICA'
			WHEN ISNULL(E.CORR_ESTADO_EXPEDIENTE, 0) = 2 THEN N'EN_SELECCION'
			ELSE N'CON_EXPEDIENTE'
		END AS VARCHAR(20)) AS ESTADO_CICLO_CANDIDATO,
		CAST(ISNULL(RC.ESTADO_DECISION, N'PENDIENTE') AS VARCHAR(20)) AS ESTADO_DECISION,
		RC.OBSERVACION_DECISION,
		RC.FECHA_DECISION,
		S.FECHA_GENERACION,
		CAST(ISNULL(EC.NOMBRE_PERSONA, S.NOMBRE) AS NVARCHAR(250)) AS NOMBRE_PERSONA,
		CAST(ISNULL(EC.DUI_PERSONA, S.DUI) AS NVARCHAR(25)) AS DUI_PERSONA,
		R.USUARIO_CREA AS USUARIO_SOLICITANTE_REQ,
		(
			SELECT COUNT(1)
			FROM dbo.SC_EXPEDIENTE_ENTREVISTA AS X
			WHERE X.CORR_EMPRESA = S.CORR_EMPRESA
			  AND X.CORR_EXPEDIENTE_CANDIDATO = ES.CORR_EXPEDIENTE_CANDIDATO
			  AND X.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
			  AND X.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
		) AS CANTIDAD_ENTREVISTAS,
		UE.ULTIMA_ENTREVISTA,
		CAST(NULL AS INT) AS CORR_REQUISICION_CANDIDATO,
		CAST(NULL AS INT) AS CORR_MOVIMIENTO_PERSONAL,
		CAST(NULL AS VARCHAR(10)) AS ESTADO_MOVIMIENTO,
		CAST(NULL AS BIT) AS CONFIRMADO,
		CAST(NULL AS INT) AS CORR_EMPLEADO,
		CAST(NULL AS DATETIME) AS FECHA_EFECTIVA,
		S.FECHA_GENERACION AS FECHA_ORDEN
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
	) AS UE
	WHERE S.CORR_EMPRESA = @CORR_EMPRESA
	  AND S.ACTIVO = 1
	  AND S.CORR_PERSONA_DATOS IS NOT NULL
	  AND S.CORR_PERSONA_DATOS > 0
	  AND ISNULL(RC.ESTADO_DECISION, N'') <> N'APLICA'

	UNION ALL

	-- 3. Contrataciones
	SELECT
		CAST('CONTRATACION' AS VARCHAR(20)) AS TIPO,
		CAST(S.CORR_EMPRESA AS INT) AS CORR_EMPRESA,
		SR.CORR_REQUISICION_PERSONAL,
		CAST(NULL AS INT) AS CORR_DESCRIPTOR_PUESTO,
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
		S.ESTACION_CREA,
		S.FECHA_CREA,
		S.USUARIO_ACTU,
		S.ESTACION_ACTU,
		S.FECHA_ACTU,
		S.CORR_SOLICITUD_EMPLEO,
		S.CORR_PERSONA_DATOS,
		ES.CORR_EXPEDIENTE_CANDIDATO,
		E.CORR_ESTADO_EXPEDIENTE,
		CAST(CASE
			WHEN MOV.ESTADO_MOVIMIENTO = 'AP' AND ISNULL(MOV.CONFIRMADO, 0) = 1 AND ISNULL(MOV.CORR_EMPLEADO, 0) > 0 THEN N'CONTRATADO'
			WHEN MOV.ESTADO_MOVIMIENTO = 'AP' AND ISNULL(MOV.CONFIRMADO, 0) = 1 THEN N'LISTO_CREAR_USUARIO'
			ELSE N'APLICA'
		END AS VARCHAR(20)) AS ESTADO_CICLO_CANDIDATO,
		CAST(N'APLICA' AS VARCHAR(20)) AS ESTADO_DECISION,
		RC.OBSERVACION_DECISION,
		RC.FECHA_DECISION,
		S.FECHA_GENERACION,
		CAST(ISNULL(EC.NOMBRE_PERSONA, S.NOMBRE) AS NVARCHAR(250)) AS NOMBRE_PERSONA,
		CAST(ISNULL(EC.DUI_PERSONA, S.DUI) AS NVARCHAR(25)) AS DUI_PERSONA,
		R.USUARIO_CREA AS USUARIO_SOLICITANTE_REQ,
		(
			SELECT COUNT(1)
			FROM dbo.SC_EXPEDIENTE_ENTREVISTA AS X
			WHERE X.CORR_EMPRESA = S.CORR_EMPRESA
			  AND X.CORR_EXPEDIENTE_CANDIDATO = ES.CORR_EXPEDIENTE_CANDIDATO
			  AND X.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
			  AND X.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
		) AS CANTIDAD_ENTREVISTAS,
		UE.ULTIMA_ENTREVISTA,
		RC.CORR_REQUISICION_CANDIDATO,
		MOV.CORR_MOVIMIENTO_PERSONAL,
		MOV.ESTADO_MOVIMIENTO,
		MOV.CONFIRMADO,
		MOV.CORR_EMPLEADO,
		MOV.FECHA_EFECTIVA,
		ISNULL(RC.FECHA_DECISION, S.FECHA_GENERACION) AS FECHA_ORDEN
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
	INNER JOIN dbo.SC_REQUISICION_CANDIDATO AS RC
		ON RC.CORR_EMPRESA = SR.CORR_EMPRESA
	   AND RC.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
	   AND RC.CORR_EXPEDIENTE_CANDIDATO = ES.CORR_EXPEDIENTE_CANDIDATO
	   AND RC.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
	   AND RC.ESTADO_DECISION = N'APLICA'
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
	) AS UE
	OUTER APPLY (
		SELECT TOP (1)
			M.CORR_MOVIMIENTO_PERSONAL,
			M.ESTADO_MOVIMIENTO,
			M.CONFIRMADO,
			M.CORR_EMPLEADO,
			M.FECHA_EFECTIVA
		FROM dbo.SC_MOVIMIENTO_REQUISICION AS MR
		INNER JOIN dbo.SC_MOVIMIENTO_PERSONAL AS M
			ON M.CORR_EMPRESA = MR.CORR_EMPRESA
		   AND M.CORR_MOVIMIENTO_PERSONAL = MR.CORR_MOVIMIENTO_PERSONAL
		WHERE MR.CORR_EMPRESA = RC.CORR_EMPRESA
		  AND MR.CORR_REQUISICION_PERSONAL = RC.CORR_REQUISICION_PERSONAL
		  AND MR.CORR_REQUISICION_CANDIDATO = RC.CORR_REQUISICION_CANDIDATO
		ORDER BY M.CORR_MOVIMIENTO_PERSONAL DESC
	) AS MOV
	WHERE S.CORR_EMPRESA = @CORR_EMPRESA
	  AND S.ACTIVO = 1
	  AND S.CORR_PERSONA_DATOS IS NOT NULL
	  AND S.CORR_PERSONA_DATOS > 0
) AS T";

				var whereSql = "WHERE 1 = 1";
				var parameters = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
				};

				if (!string.IsNullOrWhiteSpace(tipo) && !string.Equals(tipo, "TODOS", StringComparison.OrdinalIgnoreCase))
				{
					whereSql += " AND T.TIPO = @TIPO";
					parameters.Add(new CParameter
					{
						ParameterName = "TIPO",
						Value = tipo.Trim().ToUpper(),
						DbType = DbType.String,
					});
				}

				// Qué hace: Filtra los registros consolidados por estado de requisición (número) o estado de ciclo (texto).
				// Cómo lo hace: Evalúa si el parámetro estado es numérico para filtrar CORR_ESTADO_REQUISICION o texto para ESTADO_CICLO_CANDIDATO.
				if (!string.IsNullOrWhiteSpace(estado) && !string.Equals(estado, "TODOS", StringComparison.OrdinalIgnoreCase))
				{
					if (int.TryParse(estado, out var corrEstadoReq))
					{
						whereSql += " AND T.CORR_ESTADO_REQUISICION = @CORR_ESTADO_REQ";
						parameters.Add(new CParameter
						{
							ParameterName = "CORR_ESTADO_REQ",
							Value = corrEstadoReq,
							DbType = DbType.Int32,
						});
					}
					else
					{
						whereSql += " AND T.ESTADO_CICLO_CANDIDATO = @ESTADO_CICLO";
						parameters.Add(new CParameter
						{
							ParameterName = "ESTADO_CICLO",
							Value = estado.Trim(),
							DbType = DbType.String,
						});
					}
				}

				if (!string.IsNullOrWhiteSpace(nombreUnidad) && !string.Equals(nombreUnidad, "TODOS", StringComparison.OrdinalIgnoreCase))
				{
					whereSql += " AND T.NOMBRE_UNIDAD = @NOMBRE_UNIDAD";
					parameters.Add(new CParameter
					{
						ParameterName = "NOMBRE_UNIDAD",
						Value = nombreUnidad.Trim(),
						DbType = DbType.String,
					});
				}

				if (fechaDesde.HasValue)
				{
					whereSql += " AND T.FECHA_ORDEN >= @FECHA_DESDE";
					parameters.Add(new CParameter
					{
						ParameterName = "FECHA_DESDE",
						Value = fechaDesde.Value.Date,
						DbType = DbType.Date,
					});
				}

				if (fechaHasta.HasValue)
				{
					whereSql += " AND T.FECHA_ORDEN <= @FECHA_HASTA";
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
						CAST(ISNULL(T.CORR_REQUISICION_PERSONAL, 0) AS VARCHAR(30)) LIKE @BUSQUEDA
						OR CAST(ISNULL(T.CORR_SOLICITUD_EMPLEO, 0) AS VARCHAR(30)) LIKE @BUSQUEDA
						OR CAST(ISNULL(T.CORR_EXPEDIENTE_CANDIDATO, 0) AS VARCHAR(30)) LIKE @BUSQUEDA
						OR T.NOMBRE_PUESTO LIKE @BUSQUEDA
						OR T.NOMBRE_UNIDAD LIKE @BUSQUEDA
						OR T.NOMBRE_SOLICITANTE LIKE @BUSQUEDA
						OR T.NOMBRE_PERSONA LIKE @BUSQUEDA
						OR T.DUI_PERSONA LIKE @BUSQUEDA
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
{baseUnionSql}
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
SELECT *
{baseUnionSql}
{whereSql}
ORDER BY {orderBySql}";
				}
				else
				{
					dataSql = $@"
SELECT *
{baseUnionSql}
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
				var pageData = new List<SC_BANDEJA_TH_TODASView>().FromDataReader(dataReader).ToList();
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

		private static readonly HashSet<string> _AllowedSortFields = new(StringComparer.OrdinalIgnoreCase)
		{
			"FECHA_ORDEN",
			"TIPO",
			"NOMBRE_PUESTO",
			"NOMBRE_UNIDAD",
			"NOMBRE_SOLICITANTE",
			"CORR_REQUISICION_PERSONAL"
		};

		private static string ResolveSortField(string requested)
		{
			if (!string.IsNullOrWhiteSpace(requested) && _AllowedSortFields.Contains(requested.Trim()))
			{
				return requested.Trim();
			}

			return "FECHA_ORDEN";
		}

		// Qué hace: Construye la cláusula ORDER BY para la pestaña 'Todas' de la bandeja TH.
		// Cómo lo hace: Mapea la columna solicitada con orden secundario estable por fecha descendente.
		private static string BuildOrderBy(string sortField, string sortDir)
		{
			if (string.Equals(sortField, "NOMBRE_SOLICITANTE", StringComparison.OrdinalIgnoreCase))
			{
				return $"T.NOMBRE_SOLICITANTE {sortDir}, T.FECHA_ORDEN DESC";
			}

			if (string.Equals(sortField, "TIPO", StringComparison.OrdinalIgnoreCase))
			{
				return $"T.TIPO {sortDir}, T.FECHA_ORDEN DESC";
			}

			if (string.Equals(sortField, "NOMBRE_PUESTO", StringComparison.OrdinalIgnoreCase))
			{
				return $"T.NOMBRE_PUESTO {sortDir}, T.FECHA_ORDEN DESC";
			}

			if (string.Equals(sortField, "NOMBRE_UNIDAD", StringComparison.OrdinalIgnoreCase))
			{
				return $"T.NOMBRE_UNIDAD {sortDir}, T.FECHA_ORDEN DESC";
			}

			return $"T.FECHA_ORDEN {sortDir}, ISNULL(T.CORR_REQUISICION_PERSONAL, 0) {sortDir}";
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
