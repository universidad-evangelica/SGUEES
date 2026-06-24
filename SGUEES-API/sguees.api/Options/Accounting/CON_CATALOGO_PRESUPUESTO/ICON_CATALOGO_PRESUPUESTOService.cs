using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_CATALOGO_PRESUPUESTOService
	{
		Task<CResult> GetAllAsync(CON_CATALOGO_PRESUPUESTOParam xWhere);
		Task<CResult> GetAsync(CON_CATALOGO_PRESUPUESTOParam xWhere);
		Task<CResult> CreateAsync(CON_CATALOGO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_CATALOGO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_CATALOGO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
