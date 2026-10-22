using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public class SC_EXPEDIENTE_CANDIDATORepository : BaseRepository<SC_EXPEDIENTE_CANDIDATOTable>, ISC_EXPEDIENTE_CANDIDATORepository
	{
		private const string _TableName = "SC_EXPEDIENTE_CANDIDATO";
		private const string _ViewName = "V_SC_EXPEDIENTE_CANDIDATO";

		public SC_EXPEDIENTE_CANDIDATORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var dbWhere = xWhere
					.Where(x => x.ParameterName == "CORR_EMPRESA")
					.ToList();

				var reader = await objData.GetDataReader(_ViewName, dbWhere);
				var response = new List<SC_EXPEDIENTE_CANDIDATOView>().FromDataReader(reader)
					.OrderByDescending(x => x.CORR_EXPEDIENTE_CANDIDATO)
					.ToList();

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

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<SC_EXPEDIENTE_CANDIDATOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_EXPEDIENTE_CANDIDATO ?? 0;
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

		public async Task<CResult> CreateAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = Data.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_ESTADO_EXPEDIENTE", Value = Data.CORR_ESTADO_EXPEDIENTE, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "FECHA_GENERACION", Value = Data.FECHA_GENERACION, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "ACTIVO", Value = Data.ACTIVO, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, "CORR_EXPEDIENTE_CANDIDATO", pWhere);
				var response = new List<SC_EXPEDIENTE_CANDIDATOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_EXPEDIENTE_CANDIDATO ?? 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				var duplicateKey = IsDuplicateKeyError(e);
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = duplicateKey ? 2627 : -1;
				objResultado.ErrorMessage = duplicateKey
					? "Ya existe un expediente para esta persona o hubo un conflicto de correlativo. Intente nuevamente."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> UpdateAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "FECHA_GENERACION", Value = Data.FECHA_GENERACION, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "ACTIVO", Value = Data.ACTIVO, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = Data.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<SC_EXPEDIENTE_CANDIDATOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_EXPEDIENTE_CANDIDATO ?? Data.CORR_EXPEDIENTE_CANDIDATO;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				var duplicateKey = IsDuplicateKeyError(e);
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = duplicateKey ? 2627 : -1;
				objResultado.ErrorMessage = duplicateKey
					? "Ya existe un expediente para esta persona."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> DeleteAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = Data.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_EXPEDIENTE_CANDIDATO;
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
				objResultado.ErrorMessage = "No se puede eliminar el expediente porque tiene solicitudes asociadas.";
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> ActivarProcesoSeleccionAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_ESTADO_EXPEDIENTE", Value = 2, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = Data.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<SC_EXPEDIENTE_CANDIDATOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_EXPEDIENTE_CANDIDATO ?? Data.CORR_EXPEDIENTE_CANDIDATO;
				objResultado.ErrorCode = response == null ? -1 : 0;
				objResultado.ErrorMessage = response == null ? "No se encontró el expediente a actualizar." : "";
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

		public Task<CResult> GetEstadoAsociacionAsync(int corrEmpresa, int corrSolicitudEmpleo, string login, string estacion)
		{
			return EjecutarAsociarSpAsync(corrEmpresa, corrSolicitudEmpleo, crearExpediente: false, soloConsulta: true, login, estacion);
		}

		public Task<CResult> AsociarSolicitudAsync(int corrEmpresa, int corrSolicitudEmpleo, bool crearExpediente, string login, string estacion)
		{
			return EjecutarAsociarSpAsync(corrEmpresa, corrSolicitudEmpleo, crearExpediente, soloConsulta: false, login, estacion);
		}

		/// <summary>
		/// Ejecuta PRAL_MTTO_SC_EXPEDIENTE_ASOCIAR_SOLICITUD y mapea @SYS_* → CResult (mensajes solo del SP).
		/// </summary>
		private async Task<CResult> EjecutarAsociarSpAsync(
			int corrEmpresa,
			int corrSolicitudEmpleo,
			bool crearExpediente,
			bool soloConsulta,
			string login,
			string estacion)
		{
			const string spName = "PRAL_MTTO_SC_EXPEDIENTE_ASOCIAR_SOLICITUD";
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = corrSolicitudEmpleo, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CREAR_EXPEDIENTE", Value = crearExpediente, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "SOLO_CONSULTA", Value = soloConsulta, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = login ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = estacion ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@CORR_EXPEDIENTE_CANDIDATO", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@ESTADO", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 30 },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

				var errorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
				var mensaje = Convert.ToString(objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value) ?? string.Empty;
				var estado = Convert.ToString(objData.objCommand.Parameters["@ESTADO"].Value) ?? string.Empty;
				var corrExpObj = objData.objCommand.Parameters["@CORR_EXPEDIENTE_CANDIDATO"].Value;
				var corrExp = corrExpObj == DBNull.Value || corrExpObj == null ? 0 : Convert.ToInt32(corrExpObj);
				var filas = (int)objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;

				objResultado.Data = new SC_EXPEDIENTE_ASOCIAREstadoView
				{
					ESTADO = estado,
					CORR_SOLICITUD_EMPLEO = corrSolicitudEmpleo,
					CORR_EXPEDIENTE_CANDIDATO = corrExp,
				};
				objResultado.Result = errorCode == 0;
				objResultado.RowsAffected = filas;
				objResultado.CodeHelper = corrExp;
				objResultado.ErrorCode = errorCode;
				objResultado.ErrorMessage = mensaje;
				objResultado.ErrorSource = errorCode == 0 ? "" : "C" + _TableName + ".Mtto(" + spName + ")";
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

		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UX_SC_EXPEDIENTE_CANDIDATO_PERSONA", StringComparison.OrdinalIgnoreCase);
		}

		/// <summary>
		/// Tras Activar: nombre del candidato, REQ ligada y logins (creador REQ + jefes de unidad).
		/// </summary>
		public async Task<SC_EXPEDIENTE_ACCION_NOTIF_DTO> GetContextoNotificacionActivarAsync(
			int corrEmpresa,
			int corrExpedienteCandidato)
		{
			var dto = new SC_EXPEDIENTE_ACCION_NOTIF_DTO
			{
				CORR_EXPEDIENTE_CANDIDATO = corrExpedienteCandidato,
			};

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = corrExpedienteCandidato, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, @"
SELECT TOP 1
	E.CORR_EXPEDIENTE_CANDIDATO,
	SR.CORR_REQUISICION_PERSONAL,
	CAST(ISNULL(EC.NOMBRE_PERSONA, S.NOMBRE) AS NVARCHAR(250)) AS NOMBRE_PERSONA,
	R.NOMBRE_PUESTO,
	R.NOMBRE_UNIDAD
FROM dbo.SC_EXPEDIENTE_CANDIDATO AS E
INNER JOIN dbo.SC_EXPEDIENTE_SOLICITUD AS ES
	ON ES.CORR_EMPRESA = E.CORR_EMPRESA
   AND ES.CORR_EXPEDIENTE_CANDIDATO = E.CORR_EXPEDIENTE_CANDIDATO
INNER JOIN dbo.SC_SOLICITUD_EMPLEO AS S
	ON S.CORR_EMPRESA = ES.CORR_EMPRESA
   AND S.CORR_SOLICITUD_EMPLEO = ES.CORR_SOLICITUD_EMPLEO
INNER JOIN dbo.SC_SOLICITUD_REQUISICION AS SR
	ON SR.CORR_EMPRESA = S.CORR_EMPRESA
   AND SR.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
INNER JOIN dbo.V_SC_REQUISICION_PERSONAL AS R
	ON R.CORR_EMPRESA = SR.CORR_EMPRESA
   AND R.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
LEFT JOIN dbo.V_SC_EXPEDIENTE_CANDIDATO AS EC
	ON EC.CORR_EMPRESA = E.CORR_EMPRESA
   AND EC.CORR_EXPEDIENTE_CANDIDATO = E.CORR_EXPEDIENTE_CANDIDATO
WHERE E.CORR_EMPRESA = @CORR_EMPRESA
  AND E.CORR_EXPEDIENTE_CANDIDATO = @CORR_EXPEDIENTE_CANDIDATO
ORDER BY SR.CORR_REQUISICION_PERSONAL DESC;", p);

				if (reader.Read())
				{
					if (reader["CORR_EXPEDIENTE_CANDIDATO"] != DBNull.Value)
					{
						dto.CORR_EXPEDIENTE_CANDIDATO = Convert.ToInt32(reader["CORR_EXPEDIENTE_CANDIDATO"]);
					}
					if (reader["CORR_REQUISICION_PERSONAL"] != DBNull.Value)
					{
						dto.CORR_REQUISICION_PERSONAL = Convert.ToInt32(reader["CORR_REQUISICION_PERSONAL"]);
					}
					dto.NOMBRE_PERSONA = reader["NOMBRE_PERSONA"]?.ToString()?.Trim();
					dto.NOMBRE_PUESTO = reader["NOMBRE_PUESTO"]?.ToString()?.Trim();
					dto.NOMBRE_UNIDAD = reader["NOMBRE_UNIDAD"]?.ToString()?.Trim();
				}
				reader.Close();

				var readerDest = await objData.GetDataReader(System.Data.CommandType.Text, @"
SELECT DISTINCT LTRIM(RTRIM(X.LOGIN_DESTINO)) AS LOGIN_DESTINO
FROM (
	SELECT R.USUARIO_CREA AS LOGIN_DESTINO
	FROM dbo.SC_EXPEDIENTE_SOLICITUD AS ES
	INNER JOIN dbo.SC_SOLICITUD_REQUISICION AS SR
		ON SR.CORR_EMPRESA = ES.CORR_EMPRESA
	   AND SR.CORR_SOLICITUD_EMPLEO = ES.CORR_SOLICITUD_EMPLEO
	INNER JOIN dbo.SC_REQUISICION_PERSONAL AS R
		ON R.CORR_EMPRESA = SR.CORR_EMPRESA
	   AND R.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
	WHERE ES.CORR_EMPRESA = @CORR_EMPRESA
	  AND ES.CORR_EXPEDIENTE_CANDIDATO = @CORR_EXPEDIENTE_CANDIDATO

	UNION

	SELECT PU.LOGIN_SISTEMA AS LOGIN_DESTINO
	FROM dbo.SC_EXPEDIENTE_SOLICITUD AS ES
	INNER JOIN dbo.SC_SOLICITUD_REQUISICION AS SR
		ON SR.CORR_EMPRESA = ES.CORR_EMPRESA
	   AND SR.CORR_SOLICITUD_EMPLEO = ES.CORR_SOLICITUD_EMPLEO
	INNER JOIN dbo.SC_REQUISICION_PERSONAL AS R
		ON R.CORR_EMPRESA = SR.CORR_EMPRESA
	   AND R.CORR_REQUISICION_PERSONAL = SR.CORR_REQUISICION_PERSONAL
	INNER JOIN dbo.SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES AS J
		ON J.CORR_EMPRESA = R.CORR_EMPRESA
	   AND J.CORR_UNIDAD = R.CORR_UNIDAD
	   AND J.ACTIVO = 1
	   AND (J.FECHA_FIN IS NULL OR J.FECHA_FIN >= CAST(GETDATE() AS DATE))
	INNER JOIN dbo.GEN_EMPLEADO AS GE
		ON GE.CORR_EMPRESA = J.CORR_EMPRESA
	   AND GE.CORR_EMPLEADO = J.CORR_EMPLEADO
	   AND ISNULL(GE.ACTIVO_EMPLEADO, 0) = 1
	INNER JOIN dbo.GEN_PERSONA_USUARIO AS PU
		ON PU.CORR_PERSONA = GE.CORR_PERSONA
	WHERE ES.CORR_EMPRESA = @CORR_EMPRESA
	  AND ES.CORR_EXPEDIENTE_CANDIDATO = @CORR_EXPEDIENTE_CANDIDATO
) AS X
WHERE NULLIF(LTRIM(RTRIM(X.LOGIN_DESTINO)), N'') IS NOT NULL;", p);

				while (readerDest.Read())
				{
					var login = readerDest["LOGIN_DESTINO"]?.ToString()?.Trim();
					if (!string.IsNullOrWhiteSpace(login)
						&& !dto.LOGINS_DESTINO.Exists(x =>
							string.Equals(x, login, StringComparison.OrdinalIgnoreCase)))
					{
						dto.LOGINS_DESTINO.Add(login);
					}
				}
				readerDest.Close();
			}
			finally
			{
				objData.objConnection.Close();
			}

			return dto;
		}
	}
}
