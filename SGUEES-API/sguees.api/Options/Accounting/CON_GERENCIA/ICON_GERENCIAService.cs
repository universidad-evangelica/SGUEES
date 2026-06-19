using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_GERENCIAService
	{
		Task<CResult> GetAllAsync(CON_GERENCIAParam xWhere);
		Task<CResult> GetAsync(CON_GERENCIAParam xWhere);
		Task<CResult> CreateAsync(CON_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
