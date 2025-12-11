using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_CUADRO_COMPARATIVO_DOCRepository: IRepository<COM_CUADRO_COMPARATIVO_DOCTable>
	{
		Task<CResult> GetDocAsync(List<CParameter> xWhere);
	}
}
