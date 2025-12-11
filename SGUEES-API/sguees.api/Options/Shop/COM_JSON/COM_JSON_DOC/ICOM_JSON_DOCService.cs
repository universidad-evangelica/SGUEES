using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_JSON_DOCService
	{
		Task<CResult> GetAllAsync(COM_JSON_DOCParam xWhere);
		Task<CResult> GetAsync(COM_JSON_DOCParam xWhere);
		Task<CResult> CreateAsync(COM_JSON_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_JSON_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_JSON_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		
	}
}
