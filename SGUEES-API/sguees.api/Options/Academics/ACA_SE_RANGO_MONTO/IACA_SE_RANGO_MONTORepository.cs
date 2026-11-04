using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IACA_SE_RANGO_MONTORepository : IRepository<ACA_SE_RANGO_MONTOTable>
	{
		Task<CResult> ActivarInactivarAsync(ACA_SE_RANGO_MONTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
