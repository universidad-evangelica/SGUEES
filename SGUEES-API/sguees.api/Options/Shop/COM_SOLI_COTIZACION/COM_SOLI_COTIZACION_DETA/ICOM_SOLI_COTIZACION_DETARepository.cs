using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public interface ICOM_SOLI_COTIZACION_DETARepository: IRepository<COM_SOLI_COTIZACION_DETATable>
	{
		Task<CResult> AnularAsync(COM_SOLI_COTIZACION_DETATable Data);
	}
}
