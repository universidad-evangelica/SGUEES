using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_CENTRO_COSTO_PRESUPUESTOService
	{
		Task<CResult> GetAllAsync(CON_CENTRO_COSTO_PRESUPUESTOParam xWhere);
		Task<CResult> GetAsync(CON_CENTRO_COSTO_PRESUPUESTOParam xWhere);
		Task<CResult> CreateAsync(CON_CENTRO_COSTO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_CENTRO_COSTO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_CENTRO_COSTO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
