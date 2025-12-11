using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_ORDEN_COMPRARepository: IRepository<COM_ORDEN_COMPRATable>
	{
		Task<CResult> GetOrdenCompraImpr(List<CParameter> xWhere);
	}
}
