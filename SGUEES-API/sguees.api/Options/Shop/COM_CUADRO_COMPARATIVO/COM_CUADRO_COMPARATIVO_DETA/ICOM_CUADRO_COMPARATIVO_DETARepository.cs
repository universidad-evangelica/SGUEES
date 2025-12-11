using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_CUADRO_COMPARATIVO_DETARepository: IRepository<COM_CUADRO_COMPARATIVO_DETATable>
	{
		Task<CResult> UpdateCOM_CUADRO_COMPARATIVO_DETAAsync(COM_CUADRO_COMPARATIVO_DETA_UPDATEDTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
