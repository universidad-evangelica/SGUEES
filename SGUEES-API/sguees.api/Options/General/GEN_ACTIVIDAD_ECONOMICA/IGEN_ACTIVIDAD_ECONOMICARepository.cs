// Qué hace: contrato del repositorio GEN_ACTIVIDAD_ECONOMICA.
// Cómo lo hace: hereda IRepository y declara ActivarInactivarAsync del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_ACTIVIDAD_ECONOMICARepository : IRepository<GEN_ACTIVIDAD_ECONOMICATable>
	{
		// Qué hace: define el cambio de estado activo/inactivo de la actividad económica.
		Task<CResult> ActivarInactivarAsync(GEN_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
