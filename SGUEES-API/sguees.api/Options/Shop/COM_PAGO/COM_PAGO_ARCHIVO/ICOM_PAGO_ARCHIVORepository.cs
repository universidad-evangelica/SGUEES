using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_PAGO_ARCHIVORepository : IRepository<COM_PAGO_ARCHIVOTable>
	{
		Task<CResult> GetAllAPagarAsync(System.Collections.Generic.List<CParameter> xWhere);
		Task<CResult> GenerarMoviBancarioArchivoAsync(COM_PAGO_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
