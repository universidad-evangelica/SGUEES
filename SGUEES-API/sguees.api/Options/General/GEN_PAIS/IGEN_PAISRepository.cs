using System.Threading.Tasks;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	// Qué hace: define el contrato del repositorio de países con comprobación de duplicados.
	public interface IGEN_PAISRepository : IRepository<GEN_PAISTable>
	{
		// Qué hace: comprueba duplicados de país dentro de su ámbito funcional.
		Task<bool> ExistsByFieldAsync(string fieldName, string normalizedValue, int excludeCorrPais);
	}
}
