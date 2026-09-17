// Qué hace: contrato del repositorio GEN_ORIGEN_INGRESO.
// Cómo lo hace: hereda IRepository y declara ActivarInactivarAsync del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_ORIGEN_INGRESORepository : IRepository<GEN_ORIGEN_INGRESOTable>
	{
		// Qué hace: define el cambio de estado activo/inactivo del origen de ingreso.
		Task<CResult> ActivarInactivarAsync(GEN_ORIGEN_INGRESOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
