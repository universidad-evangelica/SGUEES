using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IACA_SE_SECCIONRepository : IRepository<ACA_SE_SECCIONTable>
	{
		Task<CResult> ActivarInactivarAsync(ACA_SE_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetSeccionesLookUpAsync();
		// Qué hace: secciones solo RANGO_MONTO para el catálogo de rangos.
		Task<CResult> GetSeccionesRangoMontoLookUpAsync();
	}
}
