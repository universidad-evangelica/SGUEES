using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IACA_SE_PREGUNTARepository : IRepository<ACA_SE_PREGUNTATable>
	{
		Task<CResult> ActivarInactivarAsync(ACA_SE_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
