using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_PAGO_DETAService
	{
		Task<CResult> GetAllAsync(COM_PAGO_DETAParam xWhere);
		Task<CResult> GetAllPendientesAsync(COM_PAGO_DETAParam xWhere);
		Task<CResult> GetAsync(COM_PAGO_DETAParam xWhere);
		Task<CResult> CreateAsync(COM_PAGO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_PAGO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_PAGO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
