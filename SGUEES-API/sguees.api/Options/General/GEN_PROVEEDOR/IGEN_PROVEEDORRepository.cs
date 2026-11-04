using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PROVEEDORRepository : IRepository<GEN_PROVEEDORTable>
	{
		Task<CResult> GetPersonasLookupAsync(int corrEmpresa, long? corrPersonaIncluir);
		Task<CResult> ActivarInactivarAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
