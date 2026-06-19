using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICON_PARTIDARepository : IRepository<CON_PARTIDATable>
	{
		Task<CResult> GetAllAplicarAsync(List<CParameter> xWhere);
		Task<CResult> AplicarAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DesAplicarAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AnularAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CrearPartidaModeloAsync(CON_PARTIDAParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CrearModeloAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ImportarExcelAsync(CON_PARTIDA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAllDetaDocAsync(List<CParameter> xWhere);
	}
}
