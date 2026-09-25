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
	/// Acceso a datos de SC_MOVIMIENTO_PERSONAL / V_SC_MOVIMIENTO_PERSONAL.
	/// Lookups viven aquí para no modificar otros controladores.
	/// </summary>
	public class SC_MOVIMIENTO_PERSONALRepository
		: BaseRepository<SC_MOVIMIENTO_PERSONALTable>, ISC_MOVIMIENTO_PERSONALRepository
	{
		private const string _TableName = "SC_MOVIMIENTO_PERSONAL";
		private const string _SpUnidadesUsuario = "PRAL_DATA_SC_UNIDADES_USUARIO";

		public SC_MOVIMIENTO_PERSONALRepository(IConfiguration config)
			: base(
				config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		private static object ToSqlDate(DateTime? fecha)
		{
			if (!fecha.HasValue || fecha.Value.Year < 1753)
			{
				return DBNull.Value;
			}

			return fecha.Value.Date;
		}

		private static object ToSqlDateTime(DateTime? fecha)
		{
			if (!fecha.HasValue || fecha.Value.Year < 1753)
			{
				return DBNull.Value;
			}

			return fecha.Value;
		}

		private static object ToDbInt(int? value)
		{
			return value.HasValue && value.Value > 0 ? value.Value : (object)DBNull.Value;
		}

		private static object ToDbDecimal(decimal? value)
		{
			return value.HasValue ? value.Value : (object)DBNull.Value;
		}

		private static object ToDbString(string value)
		{
			return string.IsNullOrWhiteSpace(value) ? (object)DBNull.Value : value.Trim();
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>()
					.FromDataReader(reader)
					.OrderByDescending(x => x.CORR_MOVIMIENTO_PERSONAL)
					.ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> CreateAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var objResultado = new CResult();

			try
			{
				var p = BuildWriteParameters(Data, includeKeys: true, includeCreateAudit: true);
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, "CORR_MOVIMIENTO_PERSONAL", pWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>().FromDataReader(reader).FirstOrDefault();

				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_MOVIMIENTO_PERSONAL ?? 0;
				objResultado.ErrorCode = response == null ? -1 : 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> UpdateAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var objResultado = new CResult();

			try
			{
				var p = BuildWriteParameters(Data, includeKeys: false, includeCreateAudit: false);
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_MOVIMIENTO_PERSONAL", Value = Data.CORR_MOVIMIENTO_PERSONAL, DbType = DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = Data.CORR_MOVIMIENTO_PERSONAL;
				objResultado.ErrorCode = response == null ? -1 : 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> DeleteAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var objResultado = new CResult();

			try
			{
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_MOVIMIENTO_PERSONAL", Value = Data.CORR_MOVIMIENTO_PERSONAL, DbType = DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_MOVIMIENTO_PERSONAL;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>
		/// Ejecuta PRAL_MTTO_SC_MOVIMIENTO_PERSONAL_AUTORIZA y relee la vista.
		/// </summary>
		public async Task<CResult> AutorizaAsync(SC_MOVIMIENTO_PERSONAL_AUTORIZAParam Data, string vLOGIN_SISTEMA)
		{
			var objResultado = new CResult();
			const string spName = "PRAL_MTTO_SC_MOVIMIENTO_PERSONAL_AUTORIZA";

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new() { ParameterName = "@CORR_MOVIMIENTO_PERSONAL", Value = Data.CORR_MOVIMIENTO_PERSONAL, DbType = DbType.Int32 },
					new()
					{
						ParameterName = "@CORR_UNIDAD_DOCUMENTO",
						Value = Data.CORR_UNIDAD_DOCUMENTO.HasValue && Data.CORR_UNIDAD_DOCUMENTO.Value > 0
							? Data.CORR_UNIDAD_DOCUMENTO.Value
							: (object)DBNull.Value,
						DbType = DbType.Int32,
					},
					new() { ParameterName = "@OPERACION", Value = Data.OPERACION, DbType = DbType.Int32 },
					new()
					{
						ParameterName = "@CORR_ACCION",
						Value = Data.CORR_ACCION.HasValue && Data.CORR_ACCION.Value > 0
							? Data.CORR_ACCION.Value
							: (object)DBNull.Value,
						DbType = DbType.Int32,
					},
					new() { ParameterName = "@LOGIN_SISTEMA", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = DbType.String },
					new() { ParameterName = "@OBSERVACION", Value = Data.OBSERVACION ?? string.Empty, DbType = DbType.String },
					new() { ParameterName = "@CORR_ESTADO", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.Output },
					new() { ParameterName = "@MENSAJE_ERROR", Value = string.Empty, DbType = DbType.String, Direction = ParameterDirection.Output, Size = 500 },
					new() { ParameterName = "@CORR_ACCION_USADA", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.Output },
					new() { ParameterName = "@CORR_PASO_ACTUAL", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.Output },
					new() { ParameterName = "@MODO", Value = string.Empty, DbType = DbType.String, Direction = ParameterDirection.Output, Size = 20 },
					new() { ParameterName = "@NOMBRE_ESTADO", Value = string.Empty, DbType = DbType.String, Direction = ParameterDirection.Output, Size = 100 },
					new() { ParameterName = "@ESTADO_MOVIMIENTO", Value = string.Empty, DbType = DbType.String, Direction = ParameterDirection.Output, Size = 2 },
				};

				await objData.ExecCmd(CommandType.StoredProcedure, spName, true, p);

				var mensajeError = objData.objCommand.Parameters["@MENSAJE_ERROR"].Value?.ToString();
				if (!string.IsNullOrWhiteSpace(mensajeError))
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_MOVIMIENTO_PERSONAL;
					objResultado.ErrorCode = -10;
					objResultado.ErrorMessage = mensajeError;
					objResultado.ErrorSource = "SC_MOVIMIENTO_PERSONAL.Autoriza";
					return objResultado;
				}

				var keyWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_MOVIMIENTO_PERSONAL", Value = Data.CORR_MOVIMIENTO_PERSONAL, DbType = DbType.Int32 },
				};

				var readerGet = await objData.GetDataReader("V_" + _TableName, keyWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>().FromDataReader(readerGet).FirstOrDefault();
				readerGet.Close();

				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = Data.CORR_MOVIMIENTO_PERSONAL;
				objResultado.ErrorCode = response == null ? -1 : 0;
				objResultado.ErrorMessage = response == null
					? "La operación de flujo se ejecutó pero no se pudo releer el movimiento."
					: string.Empty;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>
		/// Marca CONFIRMADO=1 y guarda auditoría de confirmación; relee la vista.
		/// </summary>
		public async Task<CResult> ConfirmarAsync(
			SC_MOVIMIENTO_PERSONALTable Data,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			var objResultado = new CResult();

			try
			{
				var p = new List<CParameter>
				{
					new()
					{
						ParameterName = "FECHA_EFECTIVA",
						Value = ToSqlDate(Data.FECHA_EFECTIVA),
						DbType = DbType.Date,
					},
					new() { ParameterName = "CONFIRMADO", Value = true, DbType = DbType.Boolean },
					new()
					{
						ParameterName = "USUARIO_CONFIRMA",
						Value = Data.USUARIO_CONFIRMA ?? vLOGIN_SISTEMA ?? string.Empty,
						DbType = DbType.String,
					},
					new()
					{
						ParameterName = "FECHA_CONFIRMA",
						Value = ToSqlDateTime(Data.FECHA_CONFIRMA ?? DateTime.Now),
						DbType = DbType.DateTime,
					},
					new()
					{
						ParameterName = "USUARIO_ACTU",
						Value = Data.USUARIO_ACTU ?? vLOGIN_SISTEMA ?? string.Empty,
						DbType = DbType.String,
					},
					new()
					{
						ParameterName = "ESTACION_ACTU",
						Value = Data.ESTACION_ACTU ?? vESTACION ?? string.Empty,
						DbType = DbType.String,
					},
					new()
					{
						ParameterName = "FECHA_ACTU",
						Value = ToSqlDateTime(Data.FECHA_ACTU == default ? DateTime.Now : Data.FECHA_ACTU),
						DbType = DbType.DateTime,
					},
				};

				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new()
					{
						ParameterName = "CORR_MOVIMIENTO_PERSONAL",
						Value = Data.CORR_MOVIMIENTO_PERSONAL,
						DbType = DbType.Int32,
					},
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = Data.CORR_MOVIMIENTO_PERSONAL;
				objResultado.ErrorCode = response == null ? -1 : 0;
				objResultado.ErrorMessage = response == null
					? "La confirmación se ejecutó pero no se pudo releer el movimiento."
					: string.Empty;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task RegistrarBitacoraDocumentoAsync(
			int corrEmpresa,
			int corrMovimiento,
			string login,
			string estacion,
			string estadoDestino,
			string comentario)
		{
			if (corrEmpresa <= 0 || corrMovimiento <= 0)
			{
				return;
			}

			var usuario = (login ?? string.Empty).Trim();
			if (usuario.Length > 50)
			{
				usuario = usuario.Substring(0, 50);
			}
			if (string.IsNullOrEmpty(usuario))
			{
				usuario = "SISTEMA";
			}

			var p = new List<CParameter>
			{
				new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
				new() { ParameterName = "@CORR_MOVIMIENTO_PERSONAL", Value = corrMovimiento, DbType = DbType.Int32 },
				new() { ParameterName = "@LOGIN_SISTEMA", Value = usuario, DbType = DbType.String },
				new() { ParameterName = "@ESTADO_DESTINO", Value = estadoDestino ?? "Borrador", DbType = DbType.String },
				new() { ParameterName = "@COMENTARIO", Value = comentario ?? string.Empty, DbType = DbType.String },
				new() { ParameterName = "@ESTACION_CREA", Value = (object)estacion ?? DBNull.Value, DbType = DbType.String },
			};

			await objData.ExecCmd(CommandType.Text, @"
INSERT INTO dbo.SC_MOVIMIENTO_PERSONAL_BITACORA
(
	CORR_EMPRESA,
	CORR_MOVIMIENTO_PERSONAL,
	LOGIN_SISTEMA,
	ESTADO_DESTINO,
	COMENTARIO,
	FECHA_ACCION,
	USUARIO_CREA,
	ESTACION_CREA,
	FECHA_CREA
)
VALUES
(
	@CORR_EMPRESA,
	@CORR_MOVIMIENTO_PERSONAL,
	@LOGIN_SISTEMA,
	@ESTADO_DESTINO,
	@COMENTARIO,
	GETDATE(),
	@LOGIN_SISTEMA,
	@ESTACION_CREA,
	GETDATE()
)", true, p);
		}

		public async Task<CResult> GetAllAsyncBitacora(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT
	CORR_EMPRESA,
	CORR_MOVIMIENTO_PERSONAL,
	LOGIN_SISTEMA,
	ESTADO_DESTINO,
	COMENTARIO,
	FECHA_ACCION
FROM (
	SELECT
		FB.CORR_EMPRESA,
		FB.CORR_DOCUMENTO AS CORR_MOVIMIENTO_PERSONAL,
		FB.LOGIN_SISTEMA,
		CAST(FB.ESTADO_DESTINO AS NVARCHAR(50)) AS ESTADO_DESTINO,
		CAST(FB.COMENTARIO AS NVARCHAR(MAX)) AS COMENTARIO,
		FB.FECHA_ACCION
	FROM dbo.V_SEG_FLUJO_BITACORA_FIRMAS AS FB
	WHERE FB.CORR_TIPO_DOCUMENTO = @CORR_TIPO_DOCUMENTO
	  AND FB.CORR_DOCUMENTO = @CORR_DOCUMENTO
	UNION ALL
	SELECT
		B.CORR_EMPRESA,
		B.CORR_MOVIMIENTO_PERSONAL,
		B.LOGIN_SISTEMA,
		B.ESTADO_DESTINO,
		B.COMENTARIO,
		B.FECHA_ACCION
	FROM dbo.SC_MOVIMIENTO_PERSONAL_BITACORA AS B
	WHERE B.CORR_EMPRESA = @CORR_EMPRESA
	  AND B.CORR_MOVIMIENTO_PERSONAL = @CORR_DOCUMENTO
) AS BITACORA
ORDER BY FECHA_ACCION, CORR_MOVIMIENTO_PERSONAL", xWhere);

				var response = new List<SC_MOVIMIENTO_PERSONAL_BITACORAView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>Unidades efectivas del usuario (puesto + jefe + configuradas).</summary>
		public async Task<CResult> GetUnidadesUsuarioAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(CommandType.StoredProcedure, _SpUnidadesUsuario, xWhere);
				var response = new List<SC_MOVIMIENTO_LOOKUP_UNIDADView>()
					.FromDataReader(reader)
					.OrderBy(x => x.NOMBRE_UNIDAD)
					.ToList();
				reader.Close();

				/* Enriquece DISPLAY_UNIDAD + GERENCIA_DISPLAY desde organigrama. */
				await EnrichUnidadesDisplayAsync(response, xWhere);

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private async Task EnrichUnidadesDisplayAsync(
			List<SC_MOVIMIENTO_LOOKUP_UNIDADView> unidades,
			List<CParameter> xWhere)
		{
			if (unidades == null || unidades.Count == 0)
			{
				return;
			}

			var corrEmpresa = xWhere?
				.FirstOrDefault(p => string.Equals(p.ParameterName, "CORR_EMPRESA", StringComparison.OrdinalIgnoreCase))
				?.Value;

			var pOrg = new List<CParameter>
			{
				new()
				{
					ParameterName = "CORR_EMPRESA",
					Value = corrEmpresa ?? 0,
					DbType = DbType.Int32,
				},
			};

			var readerOrg = await objData.GetDataReader(CommandType.Text, @"
SELECT
	CORR_UNIDAD,
	CODIGO_UNIDAD,
	NOMBRE_UNIDAD,
	CORR_UNIDAD_PADRE
FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES
WHERE CORR_EMPRESA = @CORR_EMPRESA", pOrg);

			var orgRows = new List<(int Corr, string Codigo, string Nombre, int? Padre)>();
			while (readerOrg.Read())
			{
				orgRows.Add((
					readerOrg.GetInt32(0),
					readerOrg.IsDBNull(1) ? string.Empty : readerOrg.GetString(1),
					readerOrg.IsDBNull(2) ? string.Empty : readerOrg.GetString(2),
					readerOrg.IsDBNull(3) ? (int?)null : readerOrg.GetInt32(3)));
			}
			readerOrg.Close();

			var byCorr = orgRows.ToDictionary(x => x.Corr);

			foreach (var u in unidades)
			{
				if (byCorr.TryGetValue(u.CORR_UNIDAD, out var row))
				{
					u.CODIGO_UNIDAD = string.IsNullOrWhiteSpace(u.CODIGO_UNIDAD) ? row.Codigo : u.CODIGO_UNIDAD;
					u.NOMBRE_UNIDAD = string.IsNullOrWhiteSpace(u.NOMBRE_UNIDAD) ? row.Nombre : u.NOMBRE_UNIDAD;
					u.CORR_UNIDAD_PADRE = row.Padre;
				}

				var codigo = (u.CODIGO_UNIDAD ?? string.Empty).Trim();
				var nombre = (u.NOMBRE_UNIDAD ?? string.Empty).Trim();
				u.DISPLAY_UNIDAD = string.IsNullOrWhiteSpace(codigo)
					? nombre
					: $"{codigo} - {nombre}";

				if (u.CORR_UNIDAD_PADRE.HasValue
					&& u.CORR_UNIDAD_PADRE.Value > 0
					&& byCorr.TryGetValue(u.CORR_UNIDAD_PADRE.Value, out var padre))
				{
					var pc = (padre.Codigo ?? string.Empty).Trim();
					var pn = (padre.Nombre ?? string.Empty).Trim();
					u.GERENCIA_DISPLAY = string.IsNullOrWhiteSpace(pc) ? pn : $"{pc} - {pn}";
				}
				else
				{
					u.GERENCIA_DISPLAY = string.Empty;
				}
			}
		}

		/// <summary>
		/// Empleados activos con puesto vigente, gerencia (padre) y documento
		/// (DUI nacional / CDR extranjero / pasaporte / vacío).
		/// </summary>
		public async Task<CResult> GetEmpleadosAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT
	E.CORR_EMPRESA,
	E.CORR_EMPLEADO,
	CAST(ISNULL(E.CODIGO_EMPLEADO, N'') AS VARCHAR(10)) AS CODIGO_EMPLEADO,
	CAST(ISNULL(PN.NOMBRE_COMPLETO, N'') AS NVARCHAR(250)) AS NOMBRE_COMPLETO,
	CAST(ISNULL(PN.ES_EXTRANJERO, 0) AS BIT) AS ES_EXTRANJERO,
	CAST(ISNULL(DOC.VALOR_DOCUMENTO, N'') AS NVARCHAR(50)) AS NUMERO_ID,
	CAST(ISNULL(PADRE.DISPLAY_UNIDAD, N'') AS NVARCHAR(200)) AS GERENCIA_ACTUAL,
	EP.CORR_UNIDAD AS CORR_UNIDAD_ACTUAL,
	CAST(ISNULL(UNI.DISPLAY_UNIDAD, N'') AS NVARCHAR(150)) AS NOMBRE_UNIDAD_ACTUAL,
	EP.CORR_PUESTO AS CORR_PUESTO_ACTUAL,
	CAST(ISNULL(PP.NOMBRE_PUESTO, N'') AS NVARCHAR(200)) AS NOMBRE_PUESTO_ACTUAL,
	EP.SUELDO AS SALARIO_ACTUAL,
	EP.CORR_TIPO_MODALIDAD AS CORR_TIPO_MODALIDAD_ACTUAL,
	CAST(ISNULL(TM.MODALIDAD_NOMBRE, N'') AS NVARCHAR(100)) AS NOMBRE_MODALIDAD_ACTUAL,
	CAST(ISNULL(EP.HORARIO_LABORAL, N'') AS NVARCHAR(250)) AS HORARIO_ACTUAL
FROM dbo.GEN_EMPLEADO AS E
INNER JOIN dbo.GEN_PERSONA_NATURAL AS PN
	ON PN.CORR_PERSONA = E.CORR_PERSONA
OUTER APPLY
(
	SELECT TOP (1)
		EP0.CORR_UNIDAD,
		EP0.CORR_PUESTO,
		EP0.SUELDO,
		EP0.HORARIO_LABORAL,
		EP0.CORR_TIPO_MODALIDAD
	FROM dbo.GEN_EMPLEADO_PUESTO AS EP0
	WHERE EP0.CORR_EMPRESA = E.CORR_EMPRESA
	  AND EP0.CORR_EMPLEADO = E.CORR_EMPLEADO
	ORDER BY
		EP0.FECHA_INGRESO DESC,
		EP0.FECHA_CREA DESC,
		EP0.CORR_PUESTO DESC
) AS EP
OUTER APPLY
(
	SELECT TOP (1) X.VALOR_DOCUMENTO
	FROM
	(
		SELECT
			D.VALOR_DOCUMENTO,
			CASE
				WHEN ISNULL(PN.ES_EXTRANJERO, 0) = 0 AND D.CORR_TIPO_DOCUMENTO_IDENTIDAD = 1 THEN 1
				WHEN ISNULL(PN.ES_EXTRANJERO, 0) = 1 AND D.CORR_TIPO_DOCUMENTO_IDENTIDAD = 8 THEN 1
				WHEN D.CORR_TIPO_DOCUMENTO_IDENTIDAD = 9 THEN 2
				ELSE 9
			END AS ORD_DOC
		FROM dbo.GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD AS D
		WHERE D.CORR_EMPRESA = E.CORR_EMPRESA
		  AND D.CORR_PERSONA = E.CORR_PERSONA
		  AND NULLIF(LTRIM(RTRIM(D.VALOR_DOCUMENTO)), N'') IS NOT NULL
	) AS X
	ORDER BY X.ORD_DOC, X.VALOR_DOCUMENTO
) AS DOC
OUTER APPLY
(
	SELECT
		U.CORR_UNIDAD_PADRE,
		CAST(U.CODIGO_UNIDAD + N' - ' + U.NOMBRE_UNIDAD AS NVARCHAR(150)) AS DISPLAY_UNIDAD
	FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES AS U
	WHERE U.CORR_EMPRESA = E.CORR_EMPRESA
	  AND U.CORR_UNIDAD = EP.CORR_UNIDAD
) AS UNI
OUTER APPLY
(
	SELECT
		CAST(P.CODIGO_UNIDAD + N' - ' + P.NOMBRE_UNIDAD AS NVARCHAR(200)) AS DISPLAY_UNIDAD
	FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES AS P
	WHERE P.CORR_EMPRESA = E.CORR_EMPRESA
	  AND P.CORR_UNIDAD = UNI.CORR_UNIDAD_PADRE
) AS PADRE
LEFT JOIN dbo.PLA_PUESTO AS PP
	ON PP.CORR_EMPRESA = E.CORR_EMPRESA
   AND PP.CORR_PUESTO = EP.CORR_PUESTO
LEFT JOIN dbo.SC_TIPO_MODALIDAD AS TM
	ON TM.CORR_EMPRESA = E.CORR_EMPRESA
   AND TM.CORR_TIPO_MODALIDAD = EP.CORR_TIPO_MODALIDAD
WHERE E.CORR_EMPRESA = @CORR_EMPRESA
  AND ISNULL(E.ACTIVO_EMPLEADO, 0) = 1
ORDER BY PN.NOMBRE_COMPLETO", xWhere);

				var response = new List<SC_MOVIMIENTO_LOOKUP_EMPLEADOView>()
					.FromDataReader(reader)
					.ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>Puestos activos de una unidad (V_GEN_UNIDADES_PUESTO).</summary>
		public async Task<CResult> GetPuestosByUnidadAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT
	CORR_EMPRESA,
	CORR_UNIDAD,
	CORR_PUESTO,
	CAST(NOMBRE_PUESTO AS NVARCHAR(200)) AS NOMBRE_PUESTO
FROM dbo.V_GEN_UNIDADES_PUESTO
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_UNIDAD = @CORR_UNIDAD
ORDER BY NOMBRE_PUESTO", xWhere);

				var response = new List<SC_MOVIMIENTO_LOOKUP_PUESTOView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>Modalidades activas de la empresa.</summary>
		public async Task<CResult> GetModalidadesAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT
	CORR_EMPRESA,
	CORR_TIPO_MODALIDAD,
	MODALIDAD_NOMBRE
FROM dbo.SC_TIPO_MODALIDAD
WHERE CORR_EMPRESA = @CORR_EMPRESA
ORDER BY MODALIDAD_NOMBRE", xWhere);

				var response = new List<SC_MOVIMIENTO_LOOKUP_MODALIDADView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>Requisición ligada al movimiento (tab de consulta). Sin puente, Data = null.</summary>
		public async Task<CResult> GetRequisicionAsociadaAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT
	MR.CORR_REQUISICION_PERSONAL,
	MR.CORR_REQUISICION_CANDIDATO,
	R.FECHA_REQUISICION,
	R.CORR_ESTADO_REQUISICION,
	CAST(CASE R.CORR_ESTADO_REQUISICION
		WHEN 1 THEN N'Borrador'
		WHEN 2 THEN N'En Aprobación'
		WHEN 3 THEN N'Devuelta'
		WHEN 4 THEN N'Rechazada'
		WHEN 5 THEN N'Aprobada'
		WHEN 6 THEN N'Publicada'
		WHEN 7 THEN N'En Reclutamiento'
		WHEN 8 THEN N'En Selección'
		WHEN 9 THEN N'En Contratación'
		WHEN 10 THEN N'Parcial Cubierta'
		WHEN 11 THEN N'Cerrada'
		WHEN 12 THEN N'Cancelada'
		ELSE N''
	END AS NVARCHAR(40)) AS NOMBRE_ESTADO,
	CAST(CASE
		WHEN LTRIM(RTRIM(ISNULL(U.CODIGO_UNIDAD, N''))) = N'' THEN ISNULL(V.NOMBRE_UNIDAD, N'')
		ELSE LTRIM(RTRIM(U.CODIGO_UNIDAD)) + N' - ' + ISNULL(V.NOMBRE_UNIDAD, N'')
	END AS NVARCHAR(200)) AS DISPLAY_UNIDAD,
	V.NOMBRE_PUESTO,
	V.MODALIDAD_NOMBRE,
	V.CORR_TIPO_CONTRATACION,
	V.NOMBRE_TIPO_CONTRATACION,
	V.NOMBRE_TIPO_VACANTE,
	V.CANTIDAD_PLAZAS,
	V.PLAZAS_CUBIERTAS,
	V.SALARIO,
	V.TIEMPO_CONTRATO,
	V.HORARIO,
	CAST(V.CORR_EMPLEADO_SUSTITUTO AS NVARCHAR(50)) AS CORR_EMPLEADO_SUSTITUTO,
	V.JUSTIFICACION
FROM dbo.SC_MOVIMIENTO_REQUISICION AS MR
INNER JOIN dbo.V_SC_REQUISICION_PERSONAL AS V
	ON V.CORR_EMPRESA = MR.CORR_EMPRESA
   AND V.CORR_REQUISICION_PERSONAL = MR.CORR_REQUISICION_PERSONAL
INNER JOIN dbo.SC_REQUISICION_PERSONAL AS R
	ON R.CORR_EMPRESA = MR.CORR_EMPRESA
   AND R.CORR_REQUISICION_PERSONAL = MR.CORR_REQUISICION_PERSONAL
LEFT JOIN dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES AS U
	ON U.CORR_EMPRESA = R.CORR_EMPRESA
   AND U.CORR_UNIDAD = R.CORR_UNIDAD
WHERE MR.CORR_EMPRESA = @CORR_EMPRESA
  AND MR.CORR_MOVIMIENTO_PERSONAL = @CORR_MOVIMIENTO_PERSONAL", xWhere);

				var response = new List<SC_MOVIMIENTO_REQUISICION_CARDView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>Guarda fecha de ingreso y la fecha de fin ya calculada.</summary>
		public async Task<CResult> RegistrarFechaIngresoAsync(SC_MOVIMIENTO_PERSONALTable Data)
		{
			var objResultado = new CResult();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "FECHA_INGRESO_PROPUESTA", Value = ToSqlDate(Data.FECHA_INGRESO_PROPUESTA), DbType = DbType.Date },
					new() { ParameterName = "FECHA_FINALIZACION", Value = ToSqlDate(Data.FECHA_FINALIZACION), DbType = DbType.Date },
					new() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU ?? string.Empty, DbType = DbType.String },
					new() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU ?? string.Empty, DbType = DbType.String },
					new() { ParameterName = "FECHA_ACTU", Value = ToSqlDateTime(Data.FECHA_ACTU == default ? DateTime.Now : Data.FECHA_ACTU), DbType = DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_MOVIMIENTO_PERSONAL", Value = Data.CORR_MOVIMIENTO_PERSONAL, DbType = DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.ErrorCode = response == null ? -1 : 0;
				objResultado.ErrorMessage = response == null
					? "No se pudo guardar la fecha de ingreso propuesta."
					: string.Empty;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private List<CParameter> BuildWriteParameters(
			SC_MOVIMIENTO_PERSONALTable Data,
			bool includeKeys,
			bool includeCreateAudit)
		{
			var p = new List<CParameter>();

			if (includeKeys)
			{
				p.Add(new CParameter { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 });
				p.Add(new CParameter
				{
					ParameterName = "CORR_MOVIMIENTO_PERSONAL",
					Value = Data.CORR_MOVIMIENTO_PERSONAL,
					DbType = DbType.Int32,
					Direction = ParameterDirection.InputOutput,
				});
			}

			p.Add(new CParameter { ParameterName = "FECHA_ELABORACION", Value = ToSqlDate(Data.FECHA_ELABORACION), DbType = DbType.Date });
			p.Add(new CParameter { ParameterName = "ORIGEN_MOVIMIENTO", Value = Data.ORIGEN_MOVIMIENTO ?? "DIRECTO", DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "TIPO_MOVIMIENTO", Value = Data.TIPO_MOVIMIENTO ?? "PERMANENTE", DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "ESTADO_MOVIMIENTO", Value = Data.ESTADO_MOVIMIENTO ?? "DI", DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "CORR_EMPLEADO", Value = ToDbInt(Data.CORR_EMPLEADO), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "NOMBRE_COMPLETO", Value = Data.NOMBRE_COMPLETO ?? string.Empty, DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "NUMERO_ID", Value = ToDbString(Data.NUMERO_ID), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "FECHA_INGRESO_PROPUESTA", Value = ToSqlDate(Data.FECHA_INGRESO_PROPUESTA), DbType = DbType.Date });
			p.Add(new CParameter { ParameterName = "FECHA_FINALIZACION", Value = ToSqlDate(Data.FECHA_FINALIZACION), DbType = DbType.Date });
			p.Add(new CParameter { ParameterName = "GERENCIA_ACTUAL", Value = ToDbString(Data.GERENCIA_ACTUAL), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "CORR_UNIDAD_ACTUAL", Value = ToDbInt(Data.CORR_UNIDAD_ACTUAL), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "NOMBRE_UNIDAD_ACTUAL", Value = ToDbString(Data.NOMBRE_UNIDAD_ACTUAL), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "CORR_PUESTO_ACTUAL", Value = ToDbInt(Data.CORR_PUESTO_ACTUAL), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "NOMBRE_PUESTO_ACTUAL", Value = ToDbString(Data.NOMBRE_PUESTO_ACTUAL), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "SALARIO_ACTUAL", Value = ToDbDecimal(Data.SALARIO_ACTUAL), DbType = DbType.Decimal });
			p.Add(new CParameter { ParameterName = "CORR_TIPO_MODALIDAD_ACTUAL", Value = ToDbInt(Data.CORR_TIPO_MODALIDAD_ACTUAL), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "NOMBRE_MODALIDAD_ACTUAL", Value = ToDbString(Data.NOMBRE_MODALIDAD_ACTUAL), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "HORARIO_ACTUAL", Value = ToDbString(Data.HORARIO_ACTUAL), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "GERENCIA_PROPUESTA", Value = ToDbString(Data.GERENCIA_PROPUESTA), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "CORR_UNIDAD_PROPUESTA", Value = ToDbInt(Data.CORR_UNIDAD_PROPUESTA), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "NOMBRE_UNIDAD_PROPUESTA", Value = ToDbString(Data.NOMBRE_UNIDAD_PROPUESTA), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "CORR_PUESTO_PROPUESTO", Value = ToDbInt(Data.CORR_PUESTO_PROPUESTO), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "NOMBRE_PUESTO_PROPUESTO", Value = ToDbString(Data.NOMBRE_PUESTO_PROPUESTO), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "SALARIO_PROPUESTO", Value = ToDbDecimal(Data.SALARIO_PROPUESTO), DbType = DbType.Decimal });
			p.Add(new CParameter { ParameterName = "CORR_TIPO_MODALIDAD_PROPUESTA", Value = ToDbInt(Data.CORR_TIPO_MODALIDAD_PROPUESTA), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "NOMBRE_MODALIDAD_PROPUESTA", Value = ToDbString(Data.NOMBRE_MODALIDAD_PROPUESTA), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "HORARIO_PROPUESTO", Value = ToDbString(Data.HORARIO_PROPUESTO), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "JUSTIFICACION", Value = ToDbString(Data.JUSTIFICACION), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "FECHA_EFECTIVA", Value = ToSqlDate(Data.FECHA_EFECTIVA), DbType = DbType.Date });

			/* Confirmación solo se escribe en alta (default 0); Put Confirmar la actualiza aparte. */
			if (includeCreateAudit)
			{
				p.Add(new CParameter { ParameterName = "CONFIRMADO", Value = false, DbType = DbType.Boolean });
				p.Add(new CParameter { ParameterName = "USUARIO_CONFIRMA", Value = DBNull.Value, DbType = DbType.String });
				p.Add(new CParameter { ParameterName = "FECHA_CONFIRMA", Value = DBNull.Value, DbType = DbType.DateTime });
				p.Add(new CParameter { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = DbType.String });
				p.Add(new CParameter { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = DbType.String });
				p.Add(new CParameter { ParameterName = "FECHA_CREA", Value = ToSqlDateTime(Data.FECHA_CREA), DbType = DbType.DateTime });
			}

			p.Add(new CParameter { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "FECHA_ACTU", Value = ToSqlDateTime(Data.FECHA_ACTU), DbType = DbType.DateTime });

			return p;
		}

		private static void SetError(CResult objResultado, Exception e)
		{
			objResultado.Data = null;
			objResultado.Result = false;
			objResultado.CodeHelper = 0;
			objResultado.ErrorCode = -1;
			objResultado.ErrorMessage = e.Message;
			objResultado.ErrorSource += $"[{e.Source}]";
		}

		public async Task<int> ResolverUnidadJefeAsync(int corrEmpresa, string login)
		{
			var unidad = 0;
			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "LOGIN_SISTEMA", Value = login ?? string.Empty, DbType = DbType.String },
				};
				var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT TOP 1 JU.CORR_UNIDAD
FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES AS JU
INNER JOIN dbo.GEN_EMPLEADO AS E
	ON E.CORR_EMPRESA = JU.CORR_EMPRESA
   AND E.CORR_EMPLEADO = JU.CORR_EMPLEADO
INNER JOIN dbo.GEN_PERSONA_USUARIO AS PU
	ON PU.CORR_PERSONA = E.CORR_PERSONA
WHERE JU.CORR_EMPRESA = @CORR_EMPRESA
  AND JU.ACTIVO = 1
  AND LTRIM(RTRIM(PU.LOGIN_SISTEMA)) = LTRIM(RTRIM(@LOGIN_SISTEMA))
ORDER BY JU.CORR_UNIDAD", p);
				if (reader.Read() && reader["CORR_UNIDAD"] != DBNull.Value)
				{
					unidad = Convert.ToInt32(reader["CORR_UNIDAD"]);
				}
				reader.Close();
			}
			finally
			{
				objData.objConnection.Close();
			}

			return unidad;
		}

		public async Task<CResult> GetAccionesFlujoAsync(int corrEmpresa, int corrMovimiento, string login)
		{
			var objResultado = new CResult();
			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_MOVIMIENTO_PERSONAL", Value = corrMovimiento, DbType = DbType.Int32 },
					new() { ParameterName = "LOGIN_SISTEMA", Value = login ?? string.Empty, DbType = DbType.String },
				};
				var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT
	M.CORR_MOVIMIENTO_PERSONAL,
	CASE
		WHEN M.ORIGEN_MOVIMIENTO = 'DIRECTO'
		 AND M.TIPO_MOVIMIENTO IN ('ASCENSO', 'TRASLADO')
		 AND M.ESTADO_MOVIMIENTO IN ('DI', 'OB')
		 AND dbo.SEG_FN_UsuarioMatchActorUnidad(
				@LOGIN_SISTEMA, 2,
				ISNULL(I.CORR_UNIDAD_DOCUMENTO, UJ.CORR_UNIDAD),
				@CORR_EMPRESA) = 1
		THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT)
	END AS PUEDE_ENVIAR,
	CASE
		WHEN M.ORIGEN_MOVIMIENTO = 'DIRECTO'
		 AND M.TIPO_MOVIMIENTO IN ('ASCENSO', 'TRASLADO')
		 AND M.ESTADO_MOVIMIENTO = 'SO'
		 AND (
				EXISTS (
					SELECT 1
					FROM dbo.SEG_FLUJO_NOTIFICACION AS N
					WHERE N.CORR_EMPRESA = I.CORR_EMPRESA
					  AND N.CORR_INSTANCIA = I.CORR_INSTANCIA
					  AND N.LOGIN_SISTEMA_DESTINO = @LOGIN_SISTEMA
					  AND ISNULL(N.PROCESADO, 0) = 0
				)
				OR dbo.SEG_FN_UsuarioMatchActorUnidad(
					@LOGIN_SISTEMA, 3, I.CORR_UNIDAD_DOCUMENTO, @CORR_EMPRESA) = 1
			)
		THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT)
	END AS PUEDE_DECIDIR,
	ISNULL(I.CORR_UNIDAD_DOCUMENTO, ISNULL(UJ.CORR_UNIDAD, 0)) AS CORR_UNIDAD_DOCUMENTO
FROM dbo.SC_MOVIMIENTO_PERSONAL AS M
LEFT JOIN dbo.SEG_FLUJO_INSTANCIA AS I
	ON I.CORR_EMPRESA = M.CORR_EMPRESA
   AND I.CORR_DOCUMENTO = M.CORR_MOVIMIENTO_PERSONAL
   AND I.ACTIVO = 1
   AND I.CORR_TIPO_DOCUMENTO = (
		SELECT TOP 1 TD.CORR_TIPO_DOCUMENTO
		FROM dbo.SEG_FLUJO_TIPO_DOCUMENTO AS TD
		WHERE TD.CORR_EMPRESA = M.CORR_EMPRESA
		  AND TD.CODIGO_OPCION = N'SC_MOVIMIENTO_PERSONAL'
		  AND TD.ACTIVO = 1
   )
OUTER APPLY (
	SELECT TOP 1 JU.CORR_UNIDAD
	FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES AS JU
	INNER JOIN dbo.GEN_EMPLEADO AS E
		ON E.CORR_EMPRESA = JU.CORR_EMPRESA
	   AND E.CORR_EMPLEADO = JU.CORR_EMPLEADO
	INNER JOIN dbo.GEN_PERSONA_USUARIO AS PU
		ON PU.CORR_PERSONA = E.CORR_PERSONA
	WHERE JU.CORR_EMPRESA = M.CORR_EMPRESA
	  AND JU.ACTIVO = 1
	  AND LTRIM(RTRIM(PU.LOGIN_SISTEMA)) = LTRIM(RTRIM(@LOGIN_SISTEMA))
	ORDER BY JU.CORR_UNIDAD
) AS UJ
WHERE M.CORR_EMPRESA = @CORR_EMPRESA
  AND M.CORR_MOVIMIENTO_PERSONAL = @CORR_MOVIMIENTO_PERSONAL", p);

				var acciones = new SC_MOVIMIENTO_PERSONAL_ACCIONESView
				{
					CORR_MOVIMIENTO_PERSONAL = corrMovimiento,
				};
				if (reader.Read())
				{
					acciones.PUEDE_ENVIAR = reader["PUEDE_ENVIAR"] != DBNull.Value && Convert.ToBoolean(reader["PUEDE_ENVIAR"]);
					var decidir = reader["PUEDE_DECIDIR"] != DBNull.Value && Convert.ToBoolean(reader["PUEDE_DECIDIR"]);
					acciones.PUEDE_APROBAR = decidir;
					acciones.PUEDE_DEVOLVER = decidir;
					acciones.PUEDE_RECHAZAR = decidir;
					acciones.CORR_UNIDAD_DOCUMENTO = reader["CORR_UNIDAD_DOCUMENTO"] == DBNull.Value
						? 0
						: Convert.ToInt32(reader["CORR_UNIDAD_DOCUMENTO"]);
				}
				reader.Close();

				objResultado.Data = acciones;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private const string _PendienteFrom = @"
FROM dbo.SC_MOVIMIENTO_PERSONAL AS M
LEFT JOIN dbo.SEG_USUARIO AS U
	ON U.LOGIN_SISTEMA = M.USUARIO_CREA
INNER JOIN dbo.SEG_FLUJO_INSTANCIA AS I
	ON I.CORR_EMPRESA = M.CORR_EMPRESA
   AND I.CORR_DOCUMENTO = M.CORR_MOVIMIENTO_PERSONAL
   AND I.ACTIVO = 1
INNER JOIN dbo.SEG_FLUJO_TIPO_DOCUMENTO AS TD
	ON TD.CORR_EMPRESA = I.CORR_EMPRESA
   AND TD.CORR_TIPO_DOCUMENTO = I.CORR_TIPO_DOCUMENTO
   AND TD.CODIGO_OPCION = N'SC_MOVIMIENTO_PERSONAL'
   AND TD.ACTIVO = 1
INNER JOIN dbo.SEG_FLUJO_NOTIFICACION AS N
	ON N.CORR_EMPRESA = I.CORR_EMPRESA
   AND N.CORR_INSTANCIA = I.CORR_INSTANCIA
   AND N.LOGIN_SISTEMA_DESTINO = @LOGIN_SISTEMA
   AND ISNULL(N.PROCESADO, 0) = 0
WHERE M.CORR_EMPRESA = @CORR_EMPRESA
  AND M.ORIGEN_MOVIMIENTO = 'DIRECTO'
  AND M.TIPO_MOVIMIENTO IN ('ASCENSO', 'TRASLADO')";

		public async Task<int> CountPendientesActorAsync(int corrEmpresa, string login)
		{
			var total = 0;
			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "LOGIN_SISTEMA", Value = login ?? string.Empty, DbType = DbType.String },
				};
				var reader = await objData.GetDataReader(
					CommandType.Text,
					"SELECT COUNT(1) AS TOTAL_ROWS " + _PendienteFrom,
					p);
				if (reader.Read())
				{
					total = Convert.ToInt32(reader["TOTAL_ROWS"]);
				}
				reader.Close();
			}
			finally
			{
				objData.objConnection.Close();
			}

			return total;
		}

		public async Task<CResult> GetPendientesActorAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();
			try
			{
				var paging = CPagingParameters.Parse(xWhere, 200);
				var corrEmpresa = 0;
				var login = "";
				var corrUnidad = 0;
				DateTime? fechaDesde = null;
				DateTime? fechaHasta = null;
				var busqueda = "";
				foreach (var item in xWhere ?? new List<CParameter>())
				{
					var name = (item.ParameterName ?? "").Trim().TrimStart('@');
					if (name.Equals("CORR_EMPRESA", StringComparison.OrdinalIgnoreCase) && item.Value != null)
						corrEmpresa = Convert.ToInt32(item.Value);
					else if (name.Equals("LOGIN_SISTEMA", StringComparison.OrdinalIgnoreCase))
						login = item.Value?.ToString() ?? "";
					else if (name.Equals("CORR_UNIDAD", StringComparison.OrdinalIgnoreCase) && item.Value != null && item.Value != DBNull.Value)
						corrUnidad = Convert.ToInt32(item.Value);
					else if (name.Equals("FECHA_DESDE", StringComparison.OrdinalIgnoreCase) && item.Value is DateTime d1)
						fechaDesde = d1.Date;
					else if (name.Equals("FECHA_HASTA", StringComparison.OrdinalIgnoreCase) && item.Value is DateTime d2)
						fechaHasta = d2.Date;
					else if (name.Equals("BUSQUEDA", StringComparison.OrdinalIgnoreCase))
						busqueda = item.Value?.ToString() ?? "";
				}

				var extra = "";
				var parameters = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "LOGIN_SISTEMA", Value = login, DbType = DbType.String },
				};
				if (corrUnidad > 0)
				{
					extra += " AND I.CORR_UNIDAD_DOCUMENTO = @CORR_UNIDAD";
					parameters.Add(new CParameter { ParameterName = "CORR_UNIDAD", Value = corrUnidad, DbType = DbType.Int32 });
				}
				if (fechaDesde.HasValue)
				{
					extra += " AND M.FECHA_ELABORACION >= @FECHA_DESDE";
					parameters.Add(new CParameter { ParameterName = "FECHA_DESDE", Value = fechaDesde.Value, DbType = DbType.Date });
				}
				if (fechaHasta.HasValue)
				{
					extra += " AND M.FECHA_ELABORACION <= @FECHA_HASTA";
					parameters.Add(new CParameter { ParameterName = "FECHA_HASTA", Value = fechaHasta.Value, DbType = DbType.Date });
				}
				if (!string.IsNullOrWhiteSpace(busqueda))
				{
					extra += @" AND (
						CAST(M.CORR_MOVIMIENTO_PERSONAL AS VARCHAR(30)) LIKE @BUSQUEDA
						OR M.NOMBRE_COMPLETO LIKE @BUSQUEDA
						OR M.NOMBRE_PUESTO_PROPUESTO LIKE @BUSQUEDA
						OR M.NOMBRE_UNIDAD_PROPUESTA LIKE @BUSQUEDA
						OR M.USUARIO_CREA LIKE @BUSQUEDA
					)";
					parameters.Add(new CParameter { ParameterName = "BUSQUEDA", Value = "%" + busqueda.Trim() + "%", DbType = DbType.String });
				}

				var sort = (paging.SortField ?? "FECHA_NOTIFICACION").ToUpperInvariant();
				var sortSql = sort switch
				{
					"CORR_MOVIMIENTO_PERSONAL" => "M.CORR_MOVIMIENTO_PERSONAL",
					"NOMBRE_COMPLETO" => "M.NOMBRE_COMPLETO",
					"FECHA_ELABORACION" => "M.FECHA_ELABORACION",
					_ => "N.FECHA_ENVIO",
				};
				var dir = paging.SortDesc ? "DESC" : "ASC";

				var countReader = await objData.GetDataReader(
					CommandType.Text,
					"SELECT COUNT(1) AS TOTAL_ROWS " + _PendienteFrom + extra,
					parameters);
				var total = 0;
				if (countReader.Read())
				{
					total = Convert.ToInt32(countReader["TOTAL_ROWS"]);
				}
				countReader.Close();

				var dataSql = @"
SELECT
	M.CORR_EMPRESA,
	M.CORR_MOVIMIENTO_PERSONAL,
	M.FECHA_ELABORACION,
	M.TIPO_MOVIMIENTO,
	CASE M.TIPO_MOVIMIENTO WHEN 'ASCENSO' THEN N'Ascenso' WHEN 'TRASLADO' THEN N'Traslado' ELSE M.TIPO_MOVIMIENTO END AS NOMBRE_TIPO_MOVIMIENTO,
	M.ESTADO_MOVIMIENTO,
	M.NOMBRE_COMPLETO,
	M.NOMBRE_PUESTO_PROPUESTO,
	M.NOMBRE_UNIDAD_PROPUESTA,
	M.CORR_UNIDAD_PROPUESTA,
	M.JUSTIFICACION,
	M.USUARIO_CREA,
	CAST(ISNULL(U.NOMBRE_USUARIO, M.USUARIO_CREA) AS NVARCHAR(120)) AS NOMBRE_SOLICITANTE,
	I.CORR_INSTANCIA,
	N.CORR_NOTIFICACION,
	N.MENSAJE AS MENSAJE_NOTIFICACION,
	N.FECHA_ENVIO AS FECHA_NOTIFICACION,
	I.CORR_UNIDAD_DOCUMENTO
" + _PendienteFrom + extra + $" ORDER BY {sortSql} {dir}";

				if (!paging.ReturnAll)
				{
					dataSql += " OFFSET @OFFSET ROWS FETCH NEXT @PAGE_SIZE ROWS ONLY";
					parameters.Add(new CParameter { ParameterName = "OFFSET", Value = paging.Offset, DbType = DbType.Int32 });
					parameters.Add(new CParameter { ParameterName = "PAGE_SIZE", Value = paging.PageSize, DbType = DbType.Int32 });
				}

				var reader = await objData.GetDataReader(CommandType.Text, dataSql, parameters);
				var rows = new List<SC_MOVIMIENTO_PERSONAL_PENDIENTEView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = rows;
				objResultado.Result = true;
				objResultado.RowsAffected = total;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}
	}
}
