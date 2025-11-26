using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_DOCUMENTO_FISICOService
	{
		Task<CResult> GetAllAsync(COM_DOCUMENTO_FISICOParam xWhere);
		Task<CResult> GetAsync(COM_DOCUMENTO_FISICOParam xWhere);
		Task<CResult> CreateAsync(COM_DOCUMENTO_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_DOCUMENTO_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_DOCUMENTO_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
