using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Services;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_EXPEDIENTE_CANDIDATOService : ISC_EXPEDIENTE_CANDIDATOService
	{
		private const string CodigoOpcionRequisicion = "SC_REQUISICION_PERSONAL";
		private const string CodigoOpcionBandejaActores = "SC_BANDEJA_ACTORES";

		private readonly ISC_EXPEDIENTE_CANDIDATORepository _repo;
		private readonly IGEN_NOTIFICACIONService _notificacion;

		public SC_EXPEDIENTE_CANDIDATOService(
			ISC_EXPEDIENTE_CANDIDATORepository repo,
			IGEN_NOTIFICACIONService notificacion)
		{
			_repo = repo;
			_notificacion = notificacion ?? throw new ArgumentNullException(nameof(notificacion));
		}

		public async Task<CResult> GetAllAsync(SC_EXPEDIENTE_CANDIDATOParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		public async Task<CResult> GetAsync(SC_EXPEDIENTE_CANDIDATOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = xWhere.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			if (Data.FECHA_GENERACION == default)
			{
				Data.FECHA_GENERACION = System.DateTime.Now;
			}

			Data.ACTIVO = true;
			if (Data.CORR_ESTADO_EXPEDIENTE <= 0)
			{
				Data.CORR_ESTADO_EXPEDIENTE = 1;
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			if (Data.CORR_EXPEDIENTE_CANDIDATO <= 0)
			{
				return ValidationError("No se pudo identificar el expediente a actualizar.");
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> GetEstadoAsociacionAsync(SC_EXPEDIENTE_ASOCIARParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			return await _repo.GetEstadoAsociacionAsync(
				Data.CORR_EMPRESA,
				Data.CORR_SOLICITUD_EMPLEO,
				vLOGIN_SISTEMA,
				vESTACION);
		}

		public async Task<CResult> AsociarSolicitudAsync(SC_EXPEDIENTE_ASOCIARParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			return await _repo.AsociarSolicitudAsync(
				Data.CORR_EMPRESA,
				Data.CORR_SOLICITUD_EMPLEO,
				Data.CREAR_EXPEDIENTE,
				vLOGIN_SISTEMA,
				vESTACION);
		}

		public async Task<CResult> ActivarProcesoSeleccionAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			if (Data.CORR_EXPEDIENTE_CANDIDATO <= 0)
			{
				return ValidationError("No se pudo identificar el expediente a actualizar.");
			}

			var actual = await GetAsync(new SC_EXPEDIENTE_CANDIDATOParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_EXPEDIENTE_CANDIDATO = Data.CORR_EXPEDIENTE_CANDIDATO,
			});

			if (!actual.Result || actual.Data == null)
			{
				return ValidationError("No se encontró el expediente.");
			}

			if (actual.Data is SC_EXPEDIENTE_CANDIDATOView vista && vista.CORR_ESTADO_EXPEDIENTE == 2)
			{
				return ValidationError("El expediente ya está en proceso de selección.");
			}

			var resultado = await _repo.ActivarProcesoSeleccionAsync(Data, vLOGIN_SISTEMA, vESTACION);
			if (!resultado.Result)
			{
				return resultado;
			}

			try
			{
				await NotificarDesdeActivarAsync(Data, (vLOGIN_SISTEMA ?? string.Empty).Trim());
			}
			catch
			{
				// Activación ya confirmada.
			}

			return resultado;
		}

		/// <summary>
		/// Acción sin flujo: avisa al creador de la REQ y jefes activos de la unidad
		/// (misma audiencia que bandeja actores · Candidatos).
		/// </summary>
		// Qué hace: Valida la sesión empresarial y delega la actualización de datos de persona al repositorio.
		// Cómo lo hace: Comprueba CORR_EMPRESA y llama a _repo.ActualizarPersonaDatosAsync.
		public async Task<CResult> ActualizarPersonaDatosAsync(
			int corrEmpresa,
			string usuario,
			string estacion,
			sguees.Models.SC_SOLICITUD_EMPLEO_PERSONA_ACTUALIZARParam data)
		{
			var empresaError = ValidateEmpresaSesion(corrEmpresa);
			if (empresaError != null)
			{
				return empresaError;
			}

			return await _repo.ActualizarPersonaDatosAsync(corrEmpresa, usuario, estacion, data);
		}

		private async Task NotificarDesdeActivarAsync(SC_EXPEDIENTE_CANDIDATOTable data, string loginActor)
		{
			var dto = await _repo.GetContextoNotificacionActivarAsync(
				data.CORR_EMPRESA,
				data.CORR_EXPEDIENTE_CANDIDATO);

			if (dto == null)
			{
				return;
			}

			var corrExp = dto.CORR_EXPEDIENTE_CANDIDATO > 0
				? dto.CORR_EXPEDIENTE_CANDIDATO
				: data.CORR_EXPEDIENTE_CANDIDATO;
			var corrReq = dto.CORR_REQUISICION_PERSONAL;
			var nombre = string.IsNullOrWhiteSpace(dto.NOMBRE_PERSONA) ? "Candidato" : dto.NOMBRE_PERSONA.Trim();
			var puesto = string.IsNullOrWhiteSpace(dto.NOMBRE_PUESTO) ? "—" : dto.NOMBRE_PUESTO.Trim();
			var unidad = string.IsNullOrWhiteSpace(dto.NOMBRE_UNIDAD) ? "—" : dto.NOMBRE_UNIDAD.Trim();

			var titulo = $"En selección · expediente #{corrExp}";
			var mensaje = corrReq > 0
				? $"{nombre} pasó a proceso de selección. REQ #{corrReq} · {puesto} ({unidad})."
				: $"{nombre} pasó a proceso de selección.";

			string urlDestino = null;
			if (corrReq > 0)
			{
				urlDestino = await _notificacion.ResolverUrlDestinoAsync(CodigoOpcionRequisicion, corrReq);
				if (string.IsNullOrWhiteSpace(urlDestino))
				{
					urlDestino = $"/sc-requisicion-personal?corr={corrReq}";
				}
			}
			else
			{
				urlDestino = await _notificacion.ResolverUrlDestinoAsync(CodigoOpcionBandejaActores, corrExp);
				if (string.IsNullOrWhiteSpace(urlDestino))
				{
					urlDestino = "/sc-bandeja-actores";
				}
			}

			var destinatarios = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
			foreach (var login in dto.LOGINS_DESTINO ?? Enumerable.Empty<string>())
			{
				if (!string.IsNullOrWhiteSpace(login))
				{
					destinatarios.Add(login.Trim());
				}
			}

			destinatarios.Remove(loginActor);
			if (destinatarios.Count == 0)
			{
				return;
			}

			foreach (var loginDestino in destinatarios)
			{
				await _notificacion.NotificarUsuarioAsync(
					corrEmpresa: data.CORR_EMPRESA,
					loginDestino: loginDestino,
					titulo: titulo,
					mensaje: mensaje,
					urlDestino: urlDestino,
					usuarioCrea: loginActor,
					estacionCrea: "API");
			}
		}

		private static List<CParameter> BuildParameters(SC_EXPEDIENTE_CANDIDATOParam xWhere)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
		}

		private static CResult Validate(SC_EXPEDIENTE_CANDIDATOTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos del expediente.");
			}

			if (Data.CORR_PERSONA_DATOS <= 0)
			{
				return ValidationError("Debe indicar la persona (CORR_PERSONA_DATOS).");
			}

			return null;
		}

		private static CResult ValidateEmpresaSesion(int corrEmpresa)
		{
			if (corrEmpresa > 0)
			{
				return null;
			}

			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = 4100,
				ErrorMessage = "No se pudo continuar porque su usuario no tiene una empresa asignada.",
				ErrorSource = "[SC_EXPEDIENTE_CANDIDATOService]",
				RowsAffected = 0
			};
		}

		private static CResult ValidationError(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = -1,
				ErrorMessage = message,
				ErrorSource = "[SC_EXPEDIENTE_CANDIDATOService]",
				RowsAffected = 0
			};
		}
	}
}
