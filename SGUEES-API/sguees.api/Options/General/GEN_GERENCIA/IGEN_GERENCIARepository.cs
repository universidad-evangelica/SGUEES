using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
// Qué hace: define el contrato del repositorio de gerencias con comprobación de duplicados.
	public interface IGEN_GERENCIARepository : IRepository<GEN_GERENCIATable>
	{
		// Qué hace: comprueba si ya existe una gerencia con el mismo código.
		Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
	}
}
