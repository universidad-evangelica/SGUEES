using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_REQUISICION_CANDIDATOService
	{
		// Qué hace: Firma del servicio para registrar la decisión del candidato (Aplica / No aplica).
		// Cómo lo hace: Expone el método con la bandera opcional de validación de jefatura.
		Task<CResult> DecideAsync(SC_REQUISICION_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION, bool validarJefatura = true);
		Task<CResult> GetPostulacionesExpedienteAsync(SC_REQUISICION_CANDIDATOParam xWhere);
	}
}
