using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	// Contrato del servicio de países (consultas, alta, baja y actualización).
	public interface IGEN_PAISService
	{
		// Define la consulta del listado de países según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_PAISParam xWhere);
		// Define la consulta de un país específica por sus claves.
		Task<CResult> GetAsync(GEN_PAISParam xWhere);
		// Define la creación validada de un país con su información de auditoría.
		Task<CResult> CreateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Define la actualización validada de un país con su información de auditoría.
		Task<CResult> UpdateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Define la eliminación de un país identificada por sus claves.
		Task<CResult> DeleteAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
