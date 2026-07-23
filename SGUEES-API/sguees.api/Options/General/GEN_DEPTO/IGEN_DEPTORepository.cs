using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	// Qué hace: define el contrato del repositorio de departamentos con comprobación de duplicados.
	public interface IGEN_DEPTORepository : IRepository<GEN_DEPTOTable>
	{
		// Qué hace: comprueba duplicados de departamento dentro de su ámbito funcional.
		Task<bool> ExistsDeptoByFieldAsync(int corrPais, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto);
	}
}
