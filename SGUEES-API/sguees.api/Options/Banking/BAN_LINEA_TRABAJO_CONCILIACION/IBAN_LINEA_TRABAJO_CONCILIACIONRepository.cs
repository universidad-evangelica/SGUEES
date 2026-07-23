using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IBAN_LINEA_TRABAJO_CONCILIACIONRepository : IRepository<BAN_LINEA_TRABAJO_CONCILIACIONTable>
	{
		Task<CResult> ActivarInactivarAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
