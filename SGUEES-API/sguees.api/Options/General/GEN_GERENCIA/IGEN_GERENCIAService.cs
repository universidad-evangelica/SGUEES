using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_GERENCIAService
	{
		Task<CResult> GetAllAsync(GEN_GERENCIAParam xWhere);
		Task<CResult> GetDistinctValuesAsync(GEN_GERENCIAParam xWhere);
		Task<CResult> GetAsync(GEN_GERENCIAParam xWhere);
		Task<CResult> CreateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
