using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_CLIENTEService
	{
		Task<CResult> GetAllAsync(GEN_CLIENTEParam xWhere);
		Task<CResult> GetAsync(GEN_CLIENTEParam xWhere);
		Task<CResult> CreateAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
