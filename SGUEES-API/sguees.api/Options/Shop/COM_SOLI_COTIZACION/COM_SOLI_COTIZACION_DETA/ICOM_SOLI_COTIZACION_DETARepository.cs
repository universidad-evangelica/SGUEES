using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_SOLI_COTIZACION_DETARepository: IRepository<COM_SOLI_COTIZACION_DETATable>
	{
		Task<CResult> AnularAsync(COM_SOLI_COTIZACION_DETATable Data);
	}
}
