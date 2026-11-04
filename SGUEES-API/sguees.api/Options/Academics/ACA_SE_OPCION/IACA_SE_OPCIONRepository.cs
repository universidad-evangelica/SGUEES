using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IACA_SE_OPCIONRepository : IRepository<ACA_SE_OPCIONTable>
	{
		Task<CResult> ActivarInactivarAsync(ACA_SE_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
