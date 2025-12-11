using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_RUBRO_IMPUESTOService
	{
		Task<CResult> GetAllAsync(GEN_RUBRO_IMPUESTOParam xWhere);
		Task<CResult> GetAsync(GEN_RUBRO_IMPUESTOParam xWhere);
		Task<CResult> CreateAsync(GEN_RUBRO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_RUBRO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_RUBRO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
