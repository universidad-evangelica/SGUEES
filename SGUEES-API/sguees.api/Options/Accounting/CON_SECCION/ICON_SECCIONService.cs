using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_SECCIONService
	{
		Task<CResult> GetAllAsync(CON_SECCIONParam xWhere);
		Task<CResult> GetAsync(CON_SECCIONParam xWhere);
		Task<CResult> CreateAsync(CON_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
