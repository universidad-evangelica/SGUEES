using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_SE_TIPO_PREGUNTARepository : IRepository<GEN_SE_TIPO_PREGUNTATable>
	{
		Task<CResult> ActivarInactivarAsync(GEN_SE_TIPO_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetTiposActivosAsync();
	}
}
