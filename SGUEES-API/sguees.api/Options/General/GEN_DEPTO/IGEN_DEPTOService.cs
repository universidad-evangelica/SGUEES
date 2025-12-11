using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_DEPTOService
	{
		Task<CResult> GetAllAsync(GEN_DEPTOParam xWhere);
		Task<CResult> GetAsync(GEN_DEPTOParam xWhere);
		Task<CResult> CreateAsync(GEN_DEPTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_DEPTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_DEPTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		
	}
}
