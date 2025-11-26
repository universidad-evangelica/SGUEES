using eFramework.Core;
using eFramework.Data;
using scuees.Models;

namespace scuees.Repositories
{
	public interface ICOM_CUADRO_COMPARATIVO_ORDEN_COMPRARepository: IRepository<COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable>
	{
		Task<CResult> GetComCuadroComparativoOrdenImpr(List<CParameter> xWhere);
	}
}
