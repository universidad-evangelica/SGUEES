using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	// Qué hace: define el contrato del repositorio de distritos con comprobación de duplicados.
	public interface IGEN_DISTRITORepository : IRepository<GEN_DISTRITOTable>
	{
		// Qué hace: comprueba duplicados de distrito dentro de su ámbito funcional.
		Task<bool> ExistsDistritoByFieldAsync(int corrPais, int corrDepto, int corrMunicipio, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto, int excludeCorrMunicipio, int excludeCorrDistrito);
	}
}
