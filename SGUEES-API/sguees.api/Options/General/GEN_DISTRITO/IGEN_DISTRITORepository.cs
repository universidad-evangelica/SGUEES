using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	// Contrato del repositorio de distritos; extiende IRepository con chequeo de duplicados.
	public interface IGEN_DISTRITORepository : IRepository<GEN_DISTRITOTable>
	{
		// Define la comprobación de duplicados del distrito dentro de su ámbito funcional.
		Task<bool> ExistsDistritoByFieldAsync(int corrPais, int corrDepto, int corrMunicipio, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto, int excludeCorrMunicipio, int excludeCorrDistrito);
	}
}
