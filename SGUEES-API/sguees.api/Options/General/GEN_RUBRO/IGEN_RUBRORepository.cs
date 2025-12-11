using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_RUBRORepository: IRepository<GEN_RUBROTable>
	{
		Task<CResult> GetLookUpAsync(List<CParameter> xWhere);
	}
}
