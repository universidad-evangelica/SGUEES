using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IACA_SE_PUNTAJERepository : IRepository<ACA_SE_PUNTAJETable>
	{
		Task<CResult> ActivarInactivarAsync(ACA_SE_PUNTAJETable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
