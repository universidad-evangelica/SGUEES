using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_DISTRITOService
	{
		Task<CResult> GetAllAsync(GEN_DISTRITOParam xWhere);
		Task<CResult> GetAsync(GEN_DISTRITOParam xWhere);
		Task<CResult> CreateAsync(GEN_DISTRITOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_DISTRITOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_DISTRITOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
