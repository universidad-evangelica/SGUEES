using eFramework.Core;
using eFramework.Data;
using scuees.Models;

namespace scuees.Repositories
{
	public interface IGEN_RUBRORepository: IRepository<GEN_RUBROTable>
	{
		Task<CResult> GetLookUpAsync(List<CParameter> xWhere);
	}
}
