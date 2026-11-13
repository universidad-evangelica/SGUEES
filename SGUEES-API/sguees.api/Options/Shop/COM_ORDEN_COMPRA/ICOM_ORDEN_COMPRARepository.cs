using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_ORDEN_COMPRARepository : IRepository<COM_ORDEN_COMPRATable>
	{
		Task<CResult> AplicarAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AnularAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DesAplicarAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetOrdenCompraImpr(List<CParameter> xWhere);
	}
}
