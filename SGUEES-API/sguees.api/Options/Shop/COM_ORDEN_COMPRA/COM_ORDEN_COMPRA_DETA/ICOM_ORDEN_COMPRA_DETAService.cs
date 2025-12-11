using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_ORDEN_COMPRA_DETAService
	{
		Task<CResult> GetAllAsync(COM_ORDEN_COMPRA_DETAParam xWhere);
		Task<CResult> GetAsync(COM_ORDEN_COMPRA_DETAParam xWhere);
	}
}
