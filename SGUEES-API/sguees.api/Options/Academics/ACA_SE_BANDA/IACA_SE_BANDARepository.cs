// Qué hace: contrato de persistencia del catálogo bandas socioeconómico.
// Cómo lo hace: hereda IRepository y expone ActivarInactivar vía SP de estado.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IACA_SE_BANDARepository : IRepository<ACA_SE_BANDATable>
	{
		Task<CResult> ActivarInactivarAsync(ACA_SE_BANDATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
