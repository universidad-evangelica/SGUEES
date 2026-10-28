using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IACA_SE_VERSIONRepository : IRepository<ACA_SE_VERSIONTable>
	{
		Task<CResult> ActivarInactivarAsync(ACA_SE_VERSIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetVersionesActivasAsync();
	}
}
