using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	// Qué hace: define el contrato del servicio de gerencias (consultas, creación, eliminación y actualización).
	public interface IGEN_GERENCIAService
	{
		// Qué hace: lista las gerencias según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_GERENCIAParam xWhere);
		// Qué hace: obtiene una gerencia por sus claves.
		Task<CResult> GetAsync(GEN_GERENCIAParam xWhere);
		// Qué hace: crea una gerencia con auditoría.
		Task<CResult> CreateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: actualiza una gerencia con auditoría.
		Task<CResult> UpdateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: elimina una gerencia por sus claves.
		Task<CResult> DeleteAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
