using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PROVEEDORRepository : IRepository<GEN_PROVEEDORTable>
	{
		Task<CResult> GetLookupAsync(int corrEmpresa);
		Task<CResult> GetPersonasLookupAsync(int corrEmpresa, long? corrPersonaIncluir);
		Task<CResult> GetPersonaAsync(int corrEmpresa, long corrPersona);
		Task<CResult> CreatePersonaNaturalAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdatePersonaNaturalAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreatePersonaJuridicaAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdatePersonaJuridicaAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
