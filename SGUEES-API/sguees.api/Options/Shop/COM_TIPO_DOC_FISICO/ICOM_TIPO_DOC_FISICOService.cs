using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_TIPO_DOC_FISICOService
	{
		Task<CResult> GetAllAsync(COM_TIPO_DOC_FISICOParam xWhere);
		Task<CResult> GetAsync(COM_TIPO_DOC_FISICOParam xWhere);
		Task<CResult> CreateAsync(COM_TIPO_DOC_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_TIPO_DOC_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_TIPO_DOC_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
