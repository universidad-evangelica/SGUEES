using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_CUADRO_COMPARATIVO_ORDEN_COMPRARepository: IRepository<COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable>
	{
		Task<CResult> GetComCuadroComparativoOrdenImpr(List<CParameter> xWhere);
	}
}
