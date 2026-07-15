using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface IGEN_DEPTORepository : IRepository<GEN_DEPTOTable>
	{
		Task<bool> ExistsDeptoByFieldAsync(int corrPais, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto);
	}
}
