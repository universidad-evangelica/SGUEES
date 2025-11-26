using System.Threading.Tasks;
using eFramework.Core;
using eadmindevprojectmanagement.Models;

namespace eadmindevprojectmanagement.Services
{
	public interface ICOM_DOCUMENTO_TOTALService
	{
		Task<CResult> GetAllAsync(COM_DOCUMENTO_TOTALParam xWhere);
		Task<CResult> GetAsync(COM_DOCUMENTO_TOTALParam xWhere);
		Task<CResult> CreateAsync(COM_DOCUMENTO_TOTALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_DOCUMENTO_TOTALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_DOCUMENTO_TOTALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAllRubrosTemporalesAsync(COM_DOCUMENTO_TOTALParam xWhere);
	}
}
