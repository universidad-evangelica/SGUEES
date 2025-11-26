using eFramework.Data;
using eadmindevprojectmanagement.Models;
using eFramework.Core;

namespace eadmindevprojectmanagement.Repositories
{
	public interface ICOM_DOCUMENTO_TOTALRepository: IRepository<COM_DOCUMENTO_TOTALTable>
	{
		Task<CResult> GetAllRubrosTemporalesAsync(List<CParameter> xWhere);
	}
}
