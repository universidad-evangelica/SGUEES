using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	// Qué hace: define el contrato del repositorio de municipios con lookup y duplicados.
	public interface IGEN_MUNICIPIORepository : IRepository<GEN_MUNICIPIOTable>
	{
		// Qué hace: lista el catálogo de municipios para mantenimientos relacionados.
		Task<CResult> GetMunicipiosByCodigoDeptoAsync(string codigoDepto);
		// Qué hace: comprueba duplicados de municipio dentro de su ámbito funcional.
		Task<bool> ExistsMunicipioByFieldAsync(int corrPais, int corrDepto, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto, int excludeCorrMunicipio);
	}
}
