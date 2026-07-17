using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_GERENCIARepository : IRepository<GEN_GERENCIATable>
	{
		// Define la comprobación de duplicados de la gerencia dentro de su ámbito funcional.
		Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
	}
}
