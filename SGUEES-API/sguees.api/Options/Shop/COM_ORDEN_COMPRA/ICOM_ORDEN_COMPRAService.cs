using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_ORDEN_COMPRAService
	{
		Task<CResult> GetAllAsync(COM_ORDEN_COMPRAParam xWhere);
		Task<CResult> GetAsync(COM_ORDEN_COMPRAParam xWhere);
		Task<Stream> GetPDFAsync(COM_ORDEN_COMPRAParam xWhere);
	}
}
