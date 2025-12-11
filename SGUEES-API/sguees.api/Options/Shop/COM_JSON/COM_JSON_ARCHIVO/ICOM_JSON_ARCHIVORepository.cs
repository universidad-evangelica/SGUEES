using eFramework.Data;
using sguees.Models;
using eFramework.Core;

namespace sguees.Repositories
{
	public interface ICOM_JSON_ARCHIVORepository: IRepository<COM_JSON_ARCHIVOTable>
	{
		Task<CResult> CreateJsonArchivoAsync(List<CParameter> xWhere);
	}
}
