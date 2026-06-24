using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_DEPARTAMENTOService
	{
		Task<CResult> GetAllAsync(CON_DEPARTAMENTOParam xWhere);
		Task<CResult> GetAsync(CON_DEPARTAMENTOParam xWhere);
		Task<CResult> CreateAsync(CON_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
