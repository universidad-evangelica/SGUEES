using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	// Contrato del repositorio de divisiones; extiende IRepository con catálogo y chequeo de duplicados.
	public interface IGEN_DIVISIONRepository : IRepository<GEN_DIVISIONTable>
	{
		// Define la consulta del catálogo de divisiones usado por mantenimientos relacionados.
		Task<CResult> GetDivisionesAsync(List<CParameter> xWhere);
		// Define la comprobación de duplicados de la división dentro de su ámbito funcional.
		Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
	}
}
