using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_ORDEN_COMPRA_DETAService
	{
		Task<CResult> GetAllAsync(COM_ORDEN_COMPRA_DETAParam xWhere);
		Task<CResult> GetAsync(COM_ORDEN_COMPRA_DETAParam xWhere);
		Task<CResult> CreateAsync(COM_ORDEN_COMPRA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_ORDEN_COMPRA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_ORDEN_COMPRA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
