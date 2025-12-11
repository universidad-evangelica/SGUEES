using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_FORMA_PAGOService
	{
		Task<CResult> GetAllAsync(GEN_FORMA_PAGOParam xWhere);
		Task<CResult> GetAsync(GEN_FORMA_PAGOParam xWhere);
		Task<CResult> CreateAsync(GEN_FORMA_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_FORMA_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_FORMA_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
