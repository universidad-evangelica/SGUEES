using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Services;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_REQUISICION_CANDIDATOService : ISC_REQUISICION_CANDIDATOService
	{
		private const string CodigoOpcionMovimiento = "SC_MOVIMIENTO_PERSONAL";

		private readonly ISC_REQUISICION_CANDIDATORepository _repo;
		private readonly IGEN_NOTIFICACIONService _notificacion;

		public SC_REQUISICION_CANDIDATOService(
			ISC_REQUISICION_CANDIDATORepository repo,
			IGEN_NOTIFICACIONService notificacion)
		{
			_repo = repo;
			_notificacion = notificacion ?? throw new ArgumentNullException(nameof(notificacion));
		}

		// Qué hace: Registra el dictamen y notifica a TH (best-effort SignalR).
		// Cómo lo hace: Delega al repositorio; si OK, NotificarDesdeDictamenAsync.
		public async Task<CResult> DecideAsync(
			SC_REQUISICION_CANDIDATOTable Data,
			string vLOGIN_SISTEMA,
			string vESTACION,
			bool validarJefatura = true)
		{
			var resultado = await _repo.DecideAsync(Data, vLOGIN_SISTEMA, vESTACION, validarJefatura);
			if (!resultado.Result || Data == null)
			{
				return resultado;
			}

			try
			{
				await NotificarDesdeDictamenAsync(Data, (vLOGIN_SISTEMA ?? string.Empty).Trim());
			}
			catch
			{
				// El dictamen (y movimiento si APLICA) ya persistió.
			}

			return resultado;
		}

		public Task<CResult> GetPostulacionesExpedienteAsync(SC_REQUISICION_CANDIDATOParam xWhere)
		{
			return _repo.GetPostulacionesExpedienteAsync(xWhere);
		}

		/// <summary>
		/// Acción sin flujo: avisa a usuarios con menú SC_BANDEJA_TH.
		/// APLICA con movimiento → deep-link a movimiento; si no → bandeja TH.
		/// </summary>
		private async Task NotificarDesdeDictamenAsync(SC_REQUISICION_CANDIDATOTable data, string loginActor)
		{
			var dto = await _repo.GetContextoNotificacionDictamenAsync(
				data.CORR_EMPRESA,
				data.CORR_REQUISICION_PERSONAL,
				data.CORR_EXPEDIENTE_CANDIDATO);

			if (dto == null)
			{
				return;
			}

			var estado = (dto.ESTADO_DECISION ?? data.ESTADO_DECISION ?? string.Empty).Trim().ToUpperInvariant();
			var corrExp = dto.CORR_EXPEDIENTE_CANDIDATO > 0
				? dto.CORR_EXPEDIENTE_CANDIDATO
				: data.CORR_EXPEDIENTE_CANDIDATO;
			var corrReq = dto.CORR_REQUISICION_PERSONAL > 0
				? dto.CORR_REQUISICION_PERSONAL
				: data.CORR_REQUISICION_PERSONAL;
			var nombre = string.IsNullOrWhiteSpace(dto.NOMBRE_PERSONA) ? "Candidato" : dto.NOMBRE_PERSONA.Trim();
			var puesto = string.IsNullOrWhiteSpace(dto.NOMBRE_PUESTO) ? "—" : dto.NOMBRE_PUESTO.Trim();
			var unidad = string.IsNullOrWhiteSpace(dto.NOMBRE_UNIDAD) ? "—" : dto.NOMBRE_UNIDAD.Trim();
			var etiquetaEstado = estado == "APLICA" ? "APLICA" : "NO APLICA";

			var titulo = $"Dictamen candidato #{corrExp} - {etiquetaEstado}";
			var mensaje = $"{nombre} · REQ #{corrReq} · {puesto} ({unidad}).";
			if (!string.IsNullOrWhiteSpace(dto.OBSERVACION_DECISION))
			{
				mensaje += $" Observación: {dto.OBSERVACION_DECISION.Trim()}";
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
				string urlDestino;
				if (estado == "APLICA" && dto.CORR_MOVIMIENTO_PERSONAL > 0)
				{
					// Seguimiento al movimiento generado (documento + corr).
					urlDestino = await _notificacion.ResolverUrlDestinoAsync(
						CodigoOpcionMovimiento,
						dto.CORR_MOVIMIENTO_PERSONAL);
					if (string.IsNullOrWhiteSpace(urlDestino))
					{
						urlDestino = $"/sc-movimiento-personal?corr={dto.CORR_MOVIMIENTO_PERSONAL}";
					}
				}
				else
				{
					// Tarea → bandeja según unidad del receptor.
					urlDestino = await _notificacion.ResolverUrlBandejaTareaAsync(
						data.CORR_EMPRESA,
						loginDestino,
						corrExp,
						"EXPEDIENTE");
				}

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
	}
}
