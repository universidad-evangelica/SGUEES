using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_PAGO_CONTAService
	{
		Task<CResult> GetAllAsync(COM_PAGO_CONTAParam xWhere);
		Task<CResult> GetAsync(COM_PAGO_CONTAParam xWhere);
		Task<CResult> CreateAsync(COM_PAGO_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_PAGO_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_PAGO_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
