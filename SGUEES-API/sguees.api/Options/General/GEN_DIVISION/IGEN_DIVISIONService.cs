using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_DIVISIONService
	{
		// Define la consulta del listado de divisiones según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_DIVISIONParam xWhere);
		// Define la consulta del catálogo de divisiones usado por mantenimientos relacionados.
		Task<CResult> GetDivisionesAsync(GEN_DIVISIONParam xWhere);
		// Define la consulta de una división específica por sus claves.
		Task<CResult> GetAsync(GEN_DIVISIONParam xWhere);
		// Define la creación validada de una división con su información de auditoría.
		Task<CResult> CreateAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Define la actualización validada de una división con su información de auditoría.
		Task<CResult> UpdateAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Define la eliminación de una división identificada por sus claves.
		Task<CResult> DeleteAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
