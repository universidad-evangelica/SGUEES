using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
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
