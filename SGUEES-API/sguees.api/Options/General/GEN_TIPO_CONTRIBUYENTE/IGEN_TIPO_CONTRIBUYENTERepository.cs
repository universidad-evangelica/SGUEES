// Qué hace: contrato del repositorio GEN_TIPO_CONTRIBUYENTE.
// Cómo lo hace: hereda IRepository y declara ActivarInactivarAsync del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_TIPO_CONTRIBUYENTERepository : IRepository<GEN_TIPO_CONTRIBUYENTETable>
	{
		// Qué hace: define el cambio de estado activo/inactivo del tipo contribuyente.
		Task<CResult> ActivarInactivarAsync(GEN_TIPO_CONTRIBUYENTETable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
