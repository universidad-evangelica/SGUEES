using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_BANCORepository : IRepository<GEN_BANCOTable>
	{
		Task<CResult> ActivarInactivarAsync(GEN_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
