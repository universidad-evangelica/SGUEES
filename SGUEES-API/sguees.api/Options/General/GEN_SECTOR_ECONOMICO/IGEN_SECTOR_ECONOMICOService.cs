using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_SECTOR_ECONOMICOService
	{
		Task<CResult> GetAllAsync(GEN_SECTOR_ECONOMICOParam xWhere);
		Task<CResult> GetAsync(GEN_SECTOR_ECONOMICOParam xWhere);
		Task<CResult> CreateAsync(GEN_SECTOR_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_SECTOR_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_SECTOR_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
