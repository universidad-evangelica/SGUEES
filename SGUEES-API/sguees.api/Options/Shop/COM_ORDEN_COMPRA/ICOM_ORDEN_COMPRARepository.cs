using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public interface ICOM_ORDEN_COMPRARepository: IRepository<COM_ORDEN_COMPRATable>
	{
		Task<CResult> GetOrdenCompraImpr(List<CParameter> xWhere);
	}
}
