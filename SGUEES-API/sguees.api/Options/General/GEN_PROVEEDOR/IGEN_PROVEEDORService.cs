using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PROVEEDORService
	{
		Task<CResult> GetAllAsync(GEN_PROVEEDORParam xWhere);
		Task<CResult> GetAsync(GEN_PROVEEDORParam xWhere);
		Task<CResult> GetPersonasLookupAsync(GEN_PROVEEDORParam xWhere);
		Task<CResult> GetPersonaAsync(GEN_PROVEEDORParam xWhere);
		Task<CResult> CreatePersonaNaturalAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdatePersonaNaturalAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreatePersonaJuridicaAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdatePersonaJuridicaAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
