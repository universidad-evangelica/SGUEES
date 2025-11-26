using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_ORDEN_COMPRA_DETAService
	{
		Task<CResult> GetAllAsync(COM_ORDEN_COMPRA_DETAParam xWhere);
		Task<CResult> GetAsync(COM_ORDEN_COMPRA_DETAParam xWhere);
	}
}
