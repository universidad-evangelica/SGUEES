using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_DIVISIONRepository : IRepository<GEN_DIVISIONTable>
	{
		Task<CResult> GetDistinctValuesAsync(List<CParameter> xWhere);
		Task<CResult> GetLookUpAsync(List<CParameter> xWhere);
		Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
	}
}
