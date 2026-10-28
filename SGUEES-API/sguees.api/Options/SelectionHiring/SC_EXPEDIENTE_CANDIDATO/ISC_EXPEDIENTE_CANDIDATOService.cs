using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_EXPEDIENTE_CANDIDATOService
	{
		Task<CResult> GetAllAsync(SC_EXPEDIENTE_CANDIDATOParam xWhere);
		Task<CResult> GetAsync(SC_EXPEDIENTE_CANDIDATOParam xWhere);
		Task<CResult> CreateAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetEstadoAsociacionAsync(SC_EXPEDIENTE_ASOCIARParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AsociarSolicitudAsync(SC_EXPEDIENTE_ASOCIARParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarProcesoSeleccionAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION);

		// Qué hace: Define la operación de servicio para actualizar los datos personales y colecciones del candidato en el expediente.
		// Cómo lo hace: Declara el contrato que valida la sesión y delega al repositorio.
		Task<CResult> ActualizarPersonaDatosAsync(
			int corrEmpresa,
			string usuario,
			string estacion,
			sguees.Models.SC_SOLICITUD_EMPLEO_PERSONA_ACTUALIZARParam data);
	}
}
