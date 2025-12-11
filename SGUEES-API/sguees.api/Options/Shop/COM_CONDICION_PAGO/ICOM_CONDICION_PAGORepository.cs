using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_CONDICION_PAGORepository: IRepository<COM_CONDICION_PAGOTable>
	{
		Task<CResult> GetAllLookUpAsync(List<CParameter> xWhere);
	}
}
