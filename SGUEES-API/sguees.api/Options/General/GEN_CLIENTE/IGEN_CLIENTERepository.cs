using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_CLIENTERepository : IRepository<GEN_CLIENTETable>
	{
		Task<CResult> ActivarInactivarAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
