// Qué hace: contrato del repositorio GEN_TIPO_DOCUMENTO_IDENTIDAD.
// Cómo lo hace: hereda IRepository, ActivarInactivar y ExistsByField para unicidad.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_TIPO_DOCUMENTO_IDENTIDADRepository : IRepository<GEN_TIPO_DOCUMENTO_IDENTIDADTable>
	{
		Task<CResult> ActivarInactivarAsync(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);

		// Qué hace: indica si ya existe un registro con el mismo valor en el campo dado.
		Task<bool> ExistsByFieldAsync(string fieldName, string normalizedValue, int excludeCorr);
	}
}
