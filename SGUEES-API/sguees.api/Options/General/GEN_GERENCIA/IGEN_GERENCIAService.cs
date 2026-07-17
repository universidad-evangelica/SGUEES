using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_GERENCIAService
	{
		// Define la consulta del listado de gerencias según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_GERENCIAParam xWhere);
		// Define la consulta de una gerencia específica por sus claves.
		Task<CResult> GetAsync(GEN_GERENCIAParam xWhere);
		// Define la creación validada de una gerencia con su información de auditoría.
		Task<CResult> CreateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Define la actualización validada de una gerencia con su información de auditoría.
		Task<CResult> UpdateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Define la eliminación de una gerencia identificada por sus claves.
		Task<CResult> DeleteAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
