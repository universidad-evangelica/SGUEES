using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_TIPO_GASTORepository: IRepository<GEN_TIPO_GASTOTable>
	{
		Task<CResult> GetAllLookUpAsync(List<CParameter> xWhere);
	}
}
