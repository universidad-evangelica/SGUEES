using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class SC_REQUISICION_OBSERVADORESService: ISC_REQUISICION_OBSERVADORESService
	{
		private readonly ISC_REQUISICION_OBSERVADORESRepository _repo;
		private readonly IGEN_NOTIFICACIONService _notificacion;

		public SC_REQUISICION_OBSERVADORESService(
			ISC_REQUISICION_OBSERVADORESRepository repo,
			IGEN_NOTIFICACIONService notificacion)
		{
			_repo = repo;
			_notificacion = notificacion ?? throw new ArgumentNullException(nameof(notificacion));
		}

		public async Task<CResult> GetAllAsync(SC_REQUISICION_OBSERVADORESParam xWhere)
		{
			var p = new List<CParameter>
			{
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(SC_REQUISICION_OBSERVADORESParam xWhere)
		{
			var p = new List<CParameter>
			{
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> GetAllBy_CORR_REQUISICION_PERSONAL(SC_REQUISICION_OBSERVADORESParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value= xWhere.CORR_EMPRESA, DbType=DbType.Int32},
				new CParameter() {ParameterName="CORR_REQUISICION_PERSONAL",Value= xWhere.CORR_REQUISICION_PERSONAL, DbType=DbType.Int32}
			};

			return await _repo.GetAllBy_CORR_REQUISICION_PERSONAL(p);
		}

		/// <summary>
		/// Notificación INFORMATIVA / seguimiento (NO es tarea de bandeja):
		/// URL = documento requisición + corr (ResolverUrlDestinoAsync).
		/// Las acciones de flujo usan ResolverUrlBandejaTareaAsync (TH vs Actores).
		/// </summary>
		public async Task<CResult> CreateBy_CORR_REQUISICION_PERSONAL(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var resultado = await _repo.CreateBy_CORR_REQUISICION_PERSONAL(Data, vLOGIN_SISTEMA, vESTACION);
			if (!resultado.Result || Data == null)
			{
				return resultado;
			}

			var corrReq = Data.CORR_REQUISICION_PERSONAL ?? 0;

			try
			{
				var urlDestino = await _notificacion.ResolverUrlDestinoAsync(
					"SC_REQUISICION_PERSONAL",
					corrReq);

				await _notificacion.NotificarUsuarioAsync(
					corrEmpresa: Data.CORR_EMPRESA,
					loginDestino: Data.LOGIN_SISTEMA,
					titulo: "Nuevo Observador",
					mensaje: "Se ha añadido un observador a la requisicion No." + corrReq,
					urlDestino: urlDestino,
					usuarioCrea: Data.USUARIO_CREA,
					estacionCrea: Data.ESTACION_CREA);
			}
			catch
			{
				// El alta del observador ya quedó confirmada.
			}

			return resultado;
		}
	}
}
