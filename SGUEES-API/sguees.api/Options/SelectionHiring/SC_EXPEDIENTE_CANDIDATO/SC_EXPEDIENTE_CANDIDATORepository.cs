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

		public async Task<CResult> GetEstadoAsociacionAsync(int corrEmpresa, int corrSolicitudEmpleo)
		{
			CResult objResultado = new();

			try
			{
				const string sql = @"
SELECT
    S.CORR_SOLICITUD_EMPLEO,
    ISNULL(S.CORR_PERSONA_DATOS, 0) AS CORR_PERSONA_DATOS,
    S.DUI AS DUI_SOLICITUD,
    P.DUI AS DUI_PERSONA,
    LTRIM(RTRIM(
        CONCAT(
            ISNULL(P.NOMBRE1, ''),
            CASE WHEN NULLIF(LTRIM(RTRIM(P.NOMBRE2)), '') IS NULL THEN '' ELSE ' ' + LTRIM(RTRIM(P.NOMBRE2)) END,
            CASE WHEN NULLIF(LTRIM(RTRIM(P.APELLIDO1)), '') IS NULL THEN '' ELSE ' ' + LTRIM(RTRIM(P.APELLIDO1)) END,
            CASE WHEN NULLIF(LTRIM(RTRIM(P.APELLIDO2)), '') IS NULL THEN '' ELSE ' ' + LTRIM(RTRIM(P.APELLIDO2)) END
        )
    )) AS NOMBRE_PERSONA,
    ISNULL(E.CORR_EXPEDIENTE_CANDIDATO, 0) AS CORR_EXPEDIENTE_CANDIDATO,
    CASE WHEN X.CORR_EXPEDIENTE_SOLICITUD IS NULL THEN CAST(0 AS bit) ELSE CAST(1 AS bit) END AS YA_ASOCIADA
FROM dbo.SC_SOLICITUD_EMPLEO AS S
LEFT JOIN dbo.SC_PERSONA_DATOS AS P
    ON P.CORR_EMPRESA = S.CORR_EMPRESA
   AND P.CORR_PERSONA_DATOS = S.CORR_PERSONA_DATOS
LEFT JOIN dbo.SC_EXPEDIENTE_CANDIDATO AS E
    ON E.CORR_EMPRESA = S.CORR_EMPRESA
   AND E.CORR_PERSONA_DATOS = S.CORR_PERSONA_DATOS
LEFT JOIN dbo.SC_EXPEDIENTE_SOLICITUD AS X
    ON X.CORR_EMPRESA = E.CORR_EMPRESA
   AND X.CORR_EXPEDIENTE_CANDIDATO = E.CORR_EXPEDIENTE_CANDIDATO
   AND X.CORR_SOLICITUD_EMPLEO = S.CORR_SOLICITUD_EMPLEO
WHERE S.CORR_EMPRESA = @CORR_EMPRESA
  AND S.CORR_SOLICITUD_EMPLEO = @CORR_SOLICITUD_EMPLEO";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = corrSolicitudEmpleo, DbType = System.Data.DbType.Int32 },
				});

				var estado = new SC_EXPEDIENTE_ASOCIAREstadoView
				{
					CORR_SOLICITUD_EMPLEO = corrSolicitudEmpleo,
					ESTADO = "SIN_PERSONA",
					MENSAJE = "La solicitud no existe o no tiene persona asociada.",
				};

				if (reader.Read())
				{
					var corrPersona = reader["CORR_PERSONA_DATOS"] == DBNull.Value ? 0 : Convert.ToInt32(reader["CORR_PERSONA_DATOS"]);
					var duiSol = reader["DUI_SOLICITUD"] == DBNull.Value ? "" : Convert.ToString(reader["DUI_SOLICITUD"]);
					var duiPer = reader["DUI_PERSONA"] == DBNull.Value ? "" : Convert.ToString(reader["DUI_PERSONA"]);
					var nombre = reader["NOMBRE_PERSONA"] == DBNull.Value ? "" : Convert.ToString(reader["NOMBRE_PERSONA"]);
					var corrExp = reader["CORR_EXPEDIENTE_CANDIDATO"] == DBNull.Value ? 0 : Convert.ToInt32(reader["CORR_EXPEDIENTE_CANDIDATO"]);
					var yaAsociada = reader["YA_ASOCIADA"] != DBNull.Value && Convert.ToBoolean(reader["YA_ASOCIADA"]);

					estado.CORR_PERSONA_DATOS = corrPersona;
					estado.DUI_SOLICITUD = duiSol;
					estado.DUI_PERSONA = duiPer;
					estado.NOMBRE_PERSONA = nombre;
					estado.CORR_EXPEDIENTE_CANDIDATO = corrExp;

					if (corrPersona <= 0)
					{
						estado.ESTADO = "SIN_PERSONA";
						estado.MENSAJE = "La solicitud no tiene persona asociada (CORR_PERSONA_DATOS).";
					}
					else if (!DuiCoincide(duiSol, duiPer))
					{
						estado.ESTADO = "DUI_NO_COINCIDE";
						estado.MENSAJE = "El DUI de la solicitud no coincide con el DUI de la persona asociada.";
					}
					else if (corrExp <= 0)
					{
						estado.ESTADO = "SIN_EXPEDIENTE";
						estado.MENSAJE = "No existe expediente para la persona. Confirme la creación del encabezado.";
					}
					else if (yaAsociada)
					{
						estado.ESTADO = "YA_ASOCIADA";
						estado.MENSAJE = "La solicitud ya está asociada a este expediente de candidato.";
					}
					else
					{
						estado.ESTADO = "PUEDE_ASOCIAR";
						estado.MENSAJE = "El expediente existe. Puede asociar la solicitud.";
					}
				}

				reader.Close();

				objResultado.Data = estado;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = estado.CORR_EXPEDIENTE_CANDIDATO;
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

		public async Task<CResult> AsociarSolicitudAsync(int corrEmpresa, int corrSolicitudEmpleo, bool crearExpediente, string login, string estacion)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = corrSolicitudEmpleo, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CREAR_EXPEDIENTE", Value = crearExpediente, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = login ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = estacion ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@CORR_EXPEDIENTE_CANDIDATO", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_SC_EXPEDIENTE_ASOCIAR_SOLICITUD", true, p);

				var errorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
				var mensaje = Convert.ToString(objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value) ?? string.Empty;
				var corrExpObj = objData.objCommand.Parameters["@CORR_EXPEDIENTE_CANDIDATO"].Value;
				var corrExp = corrExpObj == DBNull.Value || corrExpObj == null ? 0 : Convert.ToInt32(corrExpObj);
				var filas = (int)objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;

				SC_EXPEDIENTE_CANDIDATOView expediente = null;
				if (corrExp > 0)
				{
					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = corrExp, DbType = System.Data.DbType.Int32 },
					};
					var readerGet = await objData.GetDataReader(_ViewName, xWhere);
					expediente = new List<SC_EXPEDIENTE_CANDIDATOView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();
				}

				objResultado.Data = new
				{
					ESTADO = MapErrorToEstado(errorCode),
					MENSAJE = string.IsNullOrWhiteSpace(mensaje) && errorCode == 0
						? "Solicitud asociada al expediente correctamente."
						: mensaje,
					CORR_EXPEDIENTE_CANDIDATO = corrExp,
					CORR_SOLICITUD_EMPLEO = corrSolicitudEmpleo,
					Expediente = expediente,
				};
				objResultado.Result = errorCode == 0;
				objResultado.RowsAffected = filas;
				objResultado.CodeHelper = corrExp;
				objResultado.ErrorCode = errorCode;
				objResultado.ErrorMessage = mensaje;
				objResultado.ErrorSource = errorCode == 0 ? "" : "[PRAL_MTTO_SC_EXPEDIENTE_ASOCIAR_SOLICITUD]";
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

		private static string MapErrorToEstado(int errorCode)
		{
			return errorCode switch
			{
				0 => "ASOCIADA",
				4101 => "SIN_PERSONA",
				4102 => "DUI_NO_COINCIDE",
				4103 => "SIN_EXPEDIENTE",
				4104 => "YA_ASOCIADA",
				_ => "ERROR",
			};
		}

		private static string NormalizeDui(string dui)
		{
			if (string.IsNullOrWhiteSpace(dui))
			{
				return string.Empty;
			}

			return dui.Trim().Replace("-", "").Replace(" ", "").ToUpperInvariant();
		}

		private static bool DuiCoincide(string duiSolicitud, string duiPersona)
		{
			var a = NormalizeDui(duiSolicitud);
			var b = NormalizeDui(duiPersona);
			return !string.IsNullOrEmpty(a) && !string.IsNullOrEmpty(b) && a == b;
		}

		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UX_SC_EXPEDIENTE_CANDIDATO_PERSONA", StringComparison.OrdinalIgnoreCase);
		}
	}
}
