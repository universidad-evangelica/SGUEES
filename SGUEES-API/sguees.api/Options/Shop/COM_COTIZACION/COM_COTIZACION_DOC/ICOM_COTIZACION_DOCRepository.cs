using eFramework.Core;
using eFramework.Data;
using scuees.Models;

namespace scuees.Repositories
{
	public interface ICOM_COTIZACION_DOCRepository: IRepository<COM_COTIZACION_DOCTable>
	{
		Task<CResult> GetAllCOM_CUADRO_COMPARATIVOAsync(List<CParameter> xWhere);
		Task<CResult> GetDocAsync(List<CParameter> xWhere);
	}
}
