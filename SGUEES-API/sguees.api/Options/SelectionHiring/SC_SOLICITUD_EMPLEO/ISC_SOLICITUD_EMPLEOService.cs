using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISC_SOLICITUD_EMPLEOService
	{
		Task<CResult> GetAllAsync(SC_SOLICITUD_EMPLEOParam xWhere);
		Task<CResult> GetAsync(SC_SOLICITUD_EMPLEOParam xWhere);
		Task<CResult> CreateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActualizarPersonaDatosAsync(
			int corrEmpresa,
			string usuario,
			string estacion,
			SC_SOLICITUD_EMPLEO_PERSONA_ACTUALIZARParam data);

		Task<CResult> GetPlantillasDisponiblesAsync(int corrEmpresa);

		Task<CResult> EnviarCorreoPlantillaAsync(int corrEmpresa, string usuario, string estacion, SC_SOLICITUD_EMPLEO_ENVIAR_CORREOParam data);

		// Qué hace: consulta al repositorio si existe un candidato registrado con el DUI recibido.
		// Cómo lo hace: delega la búsqueda normalizada a _repo.BuscarCandidatoPorDuiAsync.
		Task<CResult> BuscarCandidatoPorDuiAsync(int corrEmpresa, string dui);
	}
}
