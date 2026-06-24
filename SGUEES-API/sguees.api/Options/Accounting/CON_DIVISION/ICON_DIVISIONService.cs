using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_DIVISIONService
	{
		Task<CResult> GetAllAsync(CON_DIVISIONParam xWhere);
		Task<CResult> GetAsync(CON_DIVISIONParam xWhere);
		Task<CResult> CreateAsync(CON_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
