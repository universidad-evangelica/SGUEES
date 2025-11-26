using eFramework.Data;
using scuees.Models;
using eFramework.Core;

namespace scuees.Repositories
{
	public interface ICOM_JSON_ARCHIVORepository: IRepository<COM_JSON_ARCHIVOTable>
	{
		Task<CResult> CreateJsonArchivoAsync(List<CParameter> xWhere);
	}
}
