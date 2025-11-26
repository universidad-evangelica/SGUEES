using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_TIPO_SOLI_COTIZAService
	{
		Task<CResult> GetAllAsync(COM_TIPO_SOLI_COTIZAParam xWhere);
		Task<CResult> GetAsync(COM_TIPO_SOLI_COTIZAParam xWhere);
		Task<CResult> CreateAsync(COM_TIPO_SOLI_COTIZATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_TIPO_SOLI_COTIZATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_TIPO_SOLI_COTIZATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
