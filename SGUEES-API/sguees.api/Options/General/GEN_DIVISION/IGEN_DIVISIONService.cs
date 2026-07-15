using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_DIVISIONService
	{
		Task<CResult> GetAllAsync(GEN_DIVISIONParam xWhere);
		Task<CResult> GetDivisionesAsync(GEN_DIVISIONParam xWhere);
		Task<CResult> GetAsync(GEN_DIVISIONParam xWhere);
		Task<CResult> CreateAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
