using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ISC_SOLICITUD_EMPLEORepository: IRepository<SC_SOLICITUD_EMPLEOTable>
	{
		/// <summary>Actualiza persona + colecciones vía SP atómico (RRHH).</summary>
		Task<CResult> ActualizarPersonaDatosAsync(
			int corrEmpresa,
			string usuario,
			string estacion,
			SC_SOLICITUD_EMPLEO_PERSONA_ACTUALIZARParam data);
	}
}
