using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_DOCUMENTO_DETA_DOCService
	{
		Task<CResult> GetAllAsync(COM_DOCUMENTO_DETA_DOCParam xWhere);
		Task<CResult> GetAsync(COM_DOCUMENTO_DETA_DOCParam xWhere);
		Task<CResult> CreateAsync(COM_DOCUMENTO_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_DOCUMENTO_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_DOCUMENTO_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
