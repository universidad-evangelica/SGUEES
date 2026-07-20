using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	// Qué hace: define el contrato del servicio de países (consultas, creación, eliminación y actualización).
	public interface IGEN_PAISService
	{
		// Qué hace: lista países según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_PAISParam xWhere);
		// Qué hace: obtiene país específico por sus claves.
		Task<CResult> GetAsync(GEN_PAISParam xWhere);
		// Qué hace: crea país con su información de auditoría.
		Task<CResult> CreateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: actualiza país con su información de auditoría.
		Task<CResult> UpdateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: elimina país identificado por sus claves.
		Task<CResult> DeleteAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
