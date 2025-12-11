using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_TIPO_GASTO_IMPUESTOService
	{
		Task<CResult> GetAllAsync(GEN_TIPO_GASTO_IMPUESTOParam xWhere);
		Task<CResult> GetAsync(GEN_TIPO_GASTO_IMPUESTOParam xWhere);
		Task<CResult> CreateAsync(GEN_TIPO_GASTO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_TIPO_GASTO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_TIPO_GASTO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
