using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	// Contrato del repositorio de municipios; extiende IRepository con lookup y chequeo de duplicados.
	public interface IGEN_MUNICIPIORepository : IRepository<GEN_MUNICIPIOTable>
	{
		// Define la consulta del catálogo de municipios usado por mantenimientos relacionados.
		Task<CResult> GetMunicipiosByCodigoDeptoAsync(string codigoDepto);
		// Define la comprobación de duplicados del municipio dentro de su ámbito funcional.
		Task<bool> ExistsMunicipioByFieldAsync(int corrPais, int corrDepto, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto, int excludeCorrMunicipio);
	}
}
