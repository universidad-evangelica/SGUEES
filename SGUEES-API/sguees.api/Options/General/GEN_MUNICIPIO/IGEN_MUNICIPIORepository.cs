using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface IGEN_MUNICIPIORepository : IRepository<GEN_MUNICIPIOTable>
	{
		Task<CResult> GetMunicipiosByCodigoDeptoAsync(string codigoDepto);
		Task<bool> ExistsMunicipioByFieldAsync(int corrPais, int corrDepto, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto, int excludeCorrMunicipio);
	}
}
