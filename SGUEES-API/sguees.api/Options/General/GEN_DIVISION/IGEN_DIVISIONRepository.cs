using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	// Qué hace: define el contrato del repositorio de divisiones con catálogo y duplicados.
	public interface IGEN_DIVISIONRepository : IRepository<GEN_DIVISIONTable>
	{
		// Qué hace: lista divisiones para lookups de otras vistas.
		Task<CResult> GetDivisionesAsync(List<CParameter> xWhere);
		// Qué hace: comprueba si ya existe una división con el mismo código.
		Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
	}
}
