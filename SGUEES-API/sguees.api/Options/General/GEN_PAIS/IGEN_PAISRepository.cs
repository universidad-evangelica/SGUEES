using System.Threading.Tasks;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface IGEN_PAISRepository : IRepository<GEN_PAISTable>
	{
		Task<bool> ExistsByFieldAsync(string fieldName, string normalizedValue, int excludeCorrPais);
	}
}
