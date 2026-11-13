using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_PAGO_ARCHIVOService
	{
		Task<CResult> GetAllAsync(COM_PAGO_ARCHIVOParam xWhere);
		Task<CResult> GetAllAPagarAsync(COM_PAGO_ARCHIVOParam xWhere);
		Task<CResult> GetAsync(COM_PAGO_ARCHIVOParam xWhere);
		Task<CResult> CreateAsync(COM_PAGO_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_PAGO_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_PAGO_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GenerarMoviBancarioArchivoAsync(COM_PAGO_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
