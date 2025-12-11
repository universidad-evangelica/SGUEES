using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_TIPO_DOCUMENTORepository: IRepository<GEN_TIPO_DOCUMENTOTable>
	{
		Task<CResult> GetAllLookUpAsync(List<CParameter> xWhere);
	}
}
