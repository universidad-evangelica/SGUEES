// Qué hace: contrato de servicio del catálogo bandas socioeconómico.
// Cómo lo hace: CRUD + ActivarInactivar sobre ACA_SE_BANDA.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IACA_SE_BANDAService
	{
		Task<CResult> GetAllAsync(ACA_SE_BANDAParam xWhere);
		Task<CResult> GetAsync(ACA_SE_BANDAParam xWhere);
		Task<CResult> CreateAsync(ACA_SE_BANDATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(ACA_SE_BANDATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(ACA_SE_BANDATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(ACA_SE_BANDATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
