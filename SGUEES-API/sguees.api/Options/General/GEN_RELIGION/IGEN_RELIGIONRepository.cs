// Qué hace: contrato del repositorio GEN_RELIGION.
// Cómo lo hace: hereda IRepository y declara ActivarInactivarAsync del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_RELIGIONRepository : IRepository<GEN_RELIGIONTable>
	{
		// Qué hace: define el cambio de estado activo/inactivo de la religión.
		Task<CResult> ActivarInactivarAsync(GEN_RELIGIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
