// Qué hace: contrato del repositorio GEN_PARENTESCO.
// Cómo lo hace: hereda IRepository y declara ActivarInactivarAsync del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PARENTESCORepository : IRepository<GEN_PARENTESCOTable>
	{
		Task<CResult> ActivarInactivarAsync(GEN_PARENTESCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
