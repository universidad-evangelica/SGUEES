using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_AREA_FUNCIONALService
	{
		Task<CResult> GetAllAsync(CON_AREA_FUNCIONALParam xWhere);
		Task<CResult> GetAsync(CON_AREA_FUNCIONALParam xWhere);
		Task<CResult> CreateAsync(CON_AREA_FUNCIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_AREA_FUNCIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_AREA_FUNCIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
