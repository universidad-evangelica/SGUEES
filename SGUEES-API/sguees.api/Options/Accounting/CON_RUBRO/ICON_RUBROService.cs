using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_RUBROService
	{
		Task<CResult> GetAllAsync(CON_RUBROParam xWhere);
		Task<CResult> GetAsync(CON_RUBROParam xWhere);
		Task<CResult> CreateAsync(CON_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
