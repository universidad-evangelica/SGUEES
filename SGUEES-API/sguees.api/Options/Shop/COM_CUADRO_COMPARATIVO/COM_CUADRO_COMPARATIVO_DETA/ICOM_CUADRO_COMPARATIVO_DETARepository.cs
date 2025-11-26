using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public interface ICOM_CUADRO_COMPARATIVO_DETARepository: IRepository<COM_CUADRO_COMPARATIVO_DETATable>
	{
		Task<CResult> UpdateCOM_CUADRO_COMPARATIVO_DETAAsync(COM_CUADRO_COMPARATIVO_DETA_UPDATEDTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
