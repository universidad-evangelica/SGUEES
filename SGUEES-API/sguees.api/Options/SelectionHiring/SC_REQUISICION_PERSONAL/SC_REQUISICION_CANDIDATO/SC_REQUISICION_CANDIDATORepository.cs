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
	public class SC_REQUISICION_CANDIDATORepository : BaseRepository<SC_REQUISICION_CANDIDATOTable>, ISC_REQUISICION_CANDIDATORepository
	{
		private const string _TableName = "SC_REQUISICION_CANDIDATO";
		private const string _ViewName = "V_SC_REQUISICION_CANDIDATO";
		private const string _ViewPostulacion = "V_SC_EXPEDIENTE_CANDIDATO_POSTULACION";
		private const string _ViewCandidatosReq = "V_SC_REQUISICION_PERSONAL_CANDIDATO";

		/// <summary>
		/// Estados de requisición que permiten decidir. Vacío = sin restricción.
		/// Cuando el flujo de aprobación esté listo, setear p.ej. new[] { 8 } (En Selección).
		/// </summary>
		private static readonly int[] EstadosRequisicionPermitidosDecision = Array.Empty<int>();

		public SC_REQUISICION_CANDIDATORepository(IConfiguration config)
			: base(
				config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public Task<CResult> GetAllAsync(List<CParameter> xWhere) =>
			Task.FromResult(ValidationResult(1000, "Use GetPostulacionesExpedienteAsync o DecideAsync."));

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<SC_REQUISICION_CANDIDATOView>().FromDataReader(reader).FirstOrDefault();
				reader?.Close();

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

		public Task<CResult> CreateAsync(SC_REQUISICION_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION) =>
			DecideAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(SC_REQUISICION_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION) =>
			Task.FromResult(ValidationResult(1001, "La decisión de jefatura no admite modificación."));

		public Task<CResult> DeleteAsync(SC_REQUISICION_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION) =>
			Task.FromResult(ValidationResult(1002, "La decisión de jefatura no admite eliminación."));

		public async Task<CResult> GetPostulacionesExpedienteAsync(SC_REQUISICION_CANDIDATOParam xWhere)
		{
			CResult objResultado = new();

			if (xWhere == null || xWhere.CORR_EXPEDIENTE_CANDIDATO <= 0)
			{
				return ValidationResult(1003, "Debe indicar el expediente de candidato.");
			}

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = xWhere.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
				};

				if (xWhere.CORR_SOLICITUD_EMPLEO > 0)
				{
					p.Add(new CParameter()
					{
						ParameterName = "CORR_SOLICITUD_EMPLEO",
						Value = xWhere.CORR_SOLICITUD_EMPLEO,
						DbType = System.Data.DbType.Int32,
					});
				}

				var reader = await objData.GetDataReader(_ViewPostulacion, p);
				var response = new List<SC_EXPEDIENTE_CANDIDATO_POSTULACIONView>()
					.FromDataReader(reader)
					.OrderBy(x => x.CORR_REQUISICION_PERSONAL)
					.ToList();
				reader?.Close();

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

		public async Task<CResult> DecideAsync(SC_REQUISICION_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null)
			{
				return ValidationResult(1004, "Datos de decisión inválidos.");
			}

			if (Data.CORR_REQUISICION_PERSONAL <= 0)
			{
				return ValidationResult(1005, "Debe indicar la requisición de personal.");
			}

			if (Data.CORR_SOLICITUD_EMPLEO <= 0)
			{
				return ValidationResult(1006, "Debe indicar la solicitud de empleo.");
			}

			if (Data.CORR_EXPEDIENTE_CANDIDATO <= 0)
			{
				return ValidationResult(1007, "Debe indicar el expediente de candidato.");
			}

			var estado = (Data.ESTADO_DECISION ?? string.Empty).Trim().ToUpperInvariant();
			if (estado != "APLICA" && estado != "NO_APLICA")
			{
				return ValidationResult(1008, "Estado de decisión inválido. Use APLICA o NO_APLICA.");
			}

			Data.ESTADO_DECISION = estado;
			Data.OBSERVACION_DECISION = string.IsNullOrWhiteSpace(Data.OBSERVACION_DECISION)
				? null
				: Data.OBSERVACION_DECISION.Trim();

			var requisicion = await GetRequisicionAsync(Data.CORR_EMPRESA, Data.CORR_REQUISICION_PERSONAL);
			if (requisicion == null)
			{
				return ValidationResult(1009, "No se encontró la requisición de personal.");
			}

			var login = (vLOGIN_SISTEMA ?? string.Empty).Trim();
			if (!await EsJefeActivoDeUnidadAsync(Data.CORR_EMPRESA, requisicion.CORR_UNIDAD, login))
			{
				return ValidationResult(
					1010,
					"Solo el jefe activo de la unidad solicitante puede decidir Aplica / No aplica.");
			}

			if (EstadosRequisicionPermitidosDecision.Length > 0
				&& !EstadosRequisicionPermitidosDecision.Contains(requisicion.CORR_ESTADO_REQUISICION))
			{
				return ValidationResult(
					1011,
					$"La requisición no está en un estado permitido para decidir (estado actual: {requisicion.CORR_ESTADO_REQUISICION}).");
			}

			if (!await ExisteCandidatoEnProcesoAsync(
					Data.CORR_EMPRESA,
					Data.CORR_REQUISICION_PERSONAL,
					Data.CORR_SOLICITUD_EMPLEO,
					Data.CORR_EXPEDIENTE_CANDIDATO))
			{
				return ValidationResult(
					1012,
					"El candidato no está en proceso de selección para esta requisición / solicitud.");
			}

			if (await ExisteDecisionAsync(
					Data.CORR_EMPRESA,
					Data.CORR_REQUISICION_PERSONAL,
					Data.CORR_EXPEDIENTE_CANDIDATO))
			{
				return ValidationResult(1013, "Ya existe una decisión para este candidato en la requisición. No se puede modificar.");
			}

			var ahora = DateTime.Now;
			Data.FECHA_DECISION = ahora;
			Data.USUARIO_DECISION = login;
			Data.USUARIO_CREA = login;
			Data.ESTACION_CREA = vESTACION;
			Data.FECHA_CREA = ahora;
			Data.USUARIO_ACTU = login;
			Data.ESTACION_ACTU = vESTACION;
			Data.FECHA_ACTU = ahora;

			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_REQUISICION_CANDIDATO", Value = Data.CORR_REQUISICION_CANDIDATO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = Data.CORR_REQUISICION_PERSONAL, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = Data.CORR_SOLICITUD_EMPLEO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = Data.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ESTADO_DECISION", Value = Data.ESTADO_DECISION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "OBSERVACION_DECISION", Value = (object)Data.OBSERVACION_DECISION ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_DECISION", Value = Data.FECHA_DECISION, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_DECISION", Value = Data.USUARIO_DECISION, DbType = System.Data.DbType.String },
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

				var reader = await objData.Insert(_TableName, p, "CORR_REQUISICION_CANDIDATO", pWhere);
				var response = new List<SC_REQUISICION_CANDIDATOView>().FromDataReader(reader).FirstOrDefault();
				reader?.Close();

				if (response == null)
				{
					var corr = p.First(x => x.ParameterName == "CORR_REQUISICION_CANDIDATO").Value is int id
						? id
						: Data.CORR_REQUISICION_CANDIDATO;
					var reload = await GetAsync(new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_REQUISICION_CANDIDATO", Value = corr, DbType = System.Data.DbType.Int32 },
					});
					response = reload.Data as SC_REQUISICION_CANDIDATOView;
				}

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_REQUISICION_CANDIDATO ?? 0;
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

		private async Task<SC_REQUISICION_PERSONALView> GetRequisicionAsync(int corrEmpresa, int corrRequisicion)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = corrRequisicion, DbType = System.Data.DbType.Int32 },
			};

			var reader = await objData.GetDataReader("V_SC_REQUISICION_PERSONAL", p);
			var row = new List<SC_REQUISICION_PERSONALView>().FromDataReader(reader).FirstOrDefault();
			reader?.Close();
			objData.objConnection.Close();
			return row;
		}

		/// <summary>
		/// Jefe activo y vigente de la unidad solicitante (LOGIN_SISTEMA o LOGIN_SISTEMA_WEB).
		/// </summary>
		private async Task<bool> EsJefeActivoDeUnidadAsync(int corrEmpresa, int corrUnidad, string login)
		{
			if (corrUnidad <= 0 || string.IsNullOrWhiteSpace(login))
			{
				return false;
			}

			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_UNIDAD", Value = corrUnidad, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "LOGIN_SISTEMA", Value = login.Trim(), DbType = System.Data.DbType.String },
			};

			var reader = await objData.GetDataReader(System.Data.CommandType.Text, @"
SELECT TOP (1) 1 AS OK
FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES AS J
INNER JOIN dbo.GEN_EMPLEADO AS GE
	ON GE.CORR_EMPRESA = J.CORR_EMPRESA
   AND GE.CORR_EMPLEADO = J.CORR_EMPLEADO
WHERE J.CORR_EMPRESA = @CORR_EMPRESA
  AND J.CORR_UNIDAD = @CORR_UNIDAD
  AND J.ACTIVO = 1
  AND (J.FECHA_FIN IS NULL OR J.FECHA_FIN >= CAST(GETDATE() AS DATE))
  AND GE.ESTADO_EMPLEADO = N'1'
  AND (
		LTRIM(RTRIM(ISNULL(GE.LOGIN_SISTEMA, N''))) = @LOGIN_SISTEMA
		OR LTRIM(RTRIM(ISNULL(GE.LOGIN_SISTEMA_WEB, N''))) = @LOGIN_SISTEMA
  )", p);

			var ok = reader.Read();
			reader?.Close();
			objData.objConnection.Close();
			return ok;
		}

		private async Task<bool> ExisteCandidatoEnProcesoAsync(
			int corrEmpresa,
			int corrRequisicion,
			int corrSolicitud,
			int corrExpediente)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = corrRequisicion, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = corrSolicitud, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = corrExpediente, DbType = System.Data.DbType.Int32 },
			};

			var reader = await objData.GetDataReader(_ViewCandidatosReq, p);
			var rows = new List<SC_REQUISICION_PERSONAL_CANDIDATOView>().FromDataReader(reader).ToList();
			reader?.Close();
			objData.objConnection.Close();
			return rows.Count > 0;
		}

		private async Task<bool> ExisteDecisionAsync(int corrEmpresa, int corrRequisicion, int corrExpediente)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = corrRequisicion, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = corrExpediente, DbType = System.Data.DbType.Int32 },
			};

			var reader = await objData.GetDataReader(_ViewName, p);
			var rows = new List<SC_REQUISICION_CANDIDATOView>().FromDataReader(reader).ToList();
			reader?.Close();
			objData.objConnection.Close();
			return rows.Count > 0;
		}

		private static void SetError(CResult result, Exception ex)
		{
			result.Data = null;
			result.Result = false;
			result.ErrorCode = -1;
			result.ErrorMessage = ex.Message;
			result.ErrorSource = $"[{ex.Source}]";
		}

		private static CResult ValidationResult(int errorCode, string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				ErrorCode = errorCode,
				ErrorMessage = message,
				ErrorSource = "[SC_REQUISICION_CANDIDATORepository]",
				RowsAffected = 0,
			};
		}
	}
}
