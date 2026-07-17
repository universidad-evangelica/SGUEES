using System.Threading.Tasks;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface IGEN_PAISRepository : IRepository<GEN_PAISTable>
	{
		// Define la comprobación de duplicados del país dentro de su ámbito funcional.
		Task<bool> ExistsByFieldAsync(string fieldName, string normalizedValue, int excludeCorrPais);
	}
}
