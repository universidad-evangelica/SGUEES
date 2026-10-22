using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface ISC_EXPEDIENTE_CANDIDATORepository : IRepository<SC_EXPEDIENTE_CANDIDATOTable>
	{
		Task<CResult> GetEstadoAsociacionAsync(int corrEmpresa, int corrSolicitudEmpleo, string login, string estacion);
		Task<CResult> AsociarSolicitudAsync(int corrEmpresa, int corrSolicitudEmpleo, bool crearExpediente, string login, string estacion);
		Task<CResult> ActivarProcesoSeleccionAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION);

		/// <summary>Contexto post-activar selección: nombre + REQ + jefes/creador.</summary>
		Task<SC_EXPEDIENTE_ACCION_NOTIF_DTO> GetContextoNotificacionActivarAsync(
			int corrEmpresa,
			int corrExpedienteCandidato);
	}
}
