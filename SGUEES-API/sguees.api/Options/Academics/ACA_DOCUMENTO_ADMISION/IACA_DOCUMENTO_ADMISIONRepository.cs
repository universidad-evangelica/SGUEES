// Qué hace: contrato del repositorio ACA_DOCUMENTO_ADMISION.
// Cómo lo hace: hereda IRepository y declara ActivarInactivarAsync del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IACA_DOCUMENTO_ADMISIONRepository : IRepository<ACA_DOCUMENTO_ADMISIONTable>
	{
		// Qué hace: define el cambio de estado activo/inactivo del documento.
		Task<CResult> ActivarInactivarAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
