using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PAISService
	{
		Task<CResult> GetAllAsync(GEN_PAISParam xWhere);
		Task<CResult> GetAsync(GEN_PAISParam xWhere);
		Task<CResult> CreateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
