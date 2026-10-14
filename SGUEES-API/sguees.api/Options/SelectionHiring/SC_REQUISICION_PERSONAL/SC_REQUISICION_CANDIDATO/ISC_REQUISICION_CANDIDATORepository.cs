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
	}
}
