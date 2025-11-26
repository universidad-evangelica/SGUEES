using eFramework.Core;
using eFramework.Data;
using scuees.Models;

namespace scuees.Repositories
{
	public interface IGEN_TIPO_GASTORepository: IRepository<GEN_TIPO_GASTOTable>
	{
		Task<CResult> GetAllLookUpAsync(List<CParameter> xWhere);
	}
}
