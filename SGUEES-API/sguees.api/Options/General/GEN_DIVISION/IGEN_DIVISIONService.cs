using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	// Qué hace: define el contrato del servicio de divisiones (consultas, catálogo, creación, eliminación y actualización).
	public interface IGEN_DIVISIONService
	{
		// Qué hace: lista las divisiones según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_DIVISIONParam xWhere);
		// Qué hace: lista el catálogo de divisiones para mantenimientos relacionados.
		Task<CResult> GetDivisionesAsync(GEN_DIVISIONParam xWhere);
		// Qué hace: obtiene una división por sus claves.
		Task<CResult> GetAsync(GEN_DIVISIONParam xWhere);
		// Qué hace: crea una división con auditoría.
		Task<CResult> CreateAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: actualiza una división con auditoría.
		Task<CResult> UpdateAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: elimina una división por sus claves.
		Task<CResult> DeleteAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
