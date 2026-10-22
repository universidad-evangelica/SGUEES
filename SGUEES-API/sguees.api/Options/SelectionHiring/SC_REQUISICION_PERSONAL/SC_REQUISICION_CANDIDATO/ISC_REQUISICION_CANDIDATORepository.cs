using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface ISC_REQUISICION_CANDIDATORepository : IRepository<SC_REQUISICION_CANDIDATOTable>
	{
		// Qué hace: Firma para el registro de la decisión del candidato (Aplica / No aplica).
		// Cómo lo hace: Declara los parámetros requeridos y la bandera opcional para validar jefatura de unidad.
		Task<CResult> DecideAsync(SC_REQUISICION_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION, bool validarJefatura = true);
		Task<CResult> GetPostulacionesExpedienteAsync(SC_REQUISICION_CANDIDATOParam xWhere);

		/// <summary>Contexto post-dictamen para GEN_NOTIFICACION (datos + logins SC_BANDEJA_TH).</summary>
		Task<SC_REQUISICION_CANDIDATO_ACCION_NOTIF_DTO> GetContextoNotificacionDictamenAsync(
			int corrEmpresa,
			int corrRequisicionPersonal,
			int corrExpedienteCandidato);
	}
}
