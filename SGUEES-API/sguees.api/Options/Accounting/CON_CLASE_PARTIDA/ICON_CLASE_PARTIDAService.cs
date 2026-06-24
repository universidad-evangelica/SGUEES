using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_CLASE_PARTIDAService
	{
		Task<CResult> GetAllAsync(CON_CLASE_PARTIDAParam xWhere);
		Task<CResult> GetAsync(CON_CLASE_PARTIDAParam xWhere);
		Task<CResult> CreateAsync(CON_CLASE_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_CLASE_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_CLASE_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
