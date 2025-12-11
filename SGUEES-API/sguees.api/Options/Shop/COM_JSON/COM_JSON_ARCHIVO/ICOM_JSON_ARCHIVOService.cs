using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_JSON_ARCHIVOService
	{
		Task<CResult> GetAllAsync(COM_JSON_ARCHIVOParam xWhere);
		Task<CResult> GetAsync(COM_JSON_ARCHIVOParam xWhere);
		Task<CResult> CreateAsync(COM_JSON_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_JSON_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_JSON_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
