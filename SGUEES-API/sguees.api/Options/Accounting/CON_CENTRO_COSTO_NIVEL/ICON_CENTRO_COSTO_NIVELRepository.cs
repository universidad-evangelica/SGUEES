using System.Threading.Tasks;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	// Qué hace: contrato del repositorio de niveles de centro de costo.
	// Cómo lo hace: expone CRUD, unicidad y el siguiente número de nivel autoincremental.
	public interface ICON_CENTRO_COSTO_NIVELRepository : IRepository<CON_CENTRO_COSTO_NIVELTable>
	{
		Task<bool> ExistsNivelAsync(int corrEmpresa, short nivel, int excludeCorr);
		Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
		Task<short> GetNextNivelAsync(int corrEmpresa);
	}
}
