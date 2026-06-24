using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_RUBRO_NIVELService
	{
		Task<CResult> GetAllAsync(CON_RUBRO_NIVELParam xWhere);
		Task<CResult> GetAsync(CON_RUBRO_NIVELParam xWhere);
		Task<CResult> CreateAsync(CON_RUBRO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_RUBRO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_RUBRO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
