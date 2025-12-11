using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_COTIZACION_DOCRepository: IRepository<COM_COTIZACION_DOCTable>
	{
		Task<CResult> GetAllCOM_CUADRO_COMPARATIVOAsync(List<CParameter> xWhere);
		Task<CResult> GetDocAsync(List<CParameter> xWhere);
	}
}
