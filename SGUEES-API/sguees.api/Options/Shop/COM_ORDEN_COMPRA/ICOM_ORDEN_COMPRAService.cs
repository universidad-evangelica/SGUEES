using System.IO;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_ORDEN_COMPRAService
	{
		Task<CResult> GetAllAsync(COM_ORDEN_COMPRAParam xWhere);
		Task<CResult> GetAsync(COM_ORDEN_COMPRAParam xWhere);
		Task<CResult> CreateAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AplicarAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AnularAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DesAplicarAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<Stream> GetPDFAsync(COM_ORDEN_COMPRAParam xWhere);
	}
}
