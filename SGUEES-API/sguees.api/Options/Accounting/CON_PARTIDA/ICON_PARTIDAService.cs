using System.IO;

using System.Threading.Tasks;

using eFramework.Core;

using sguees.Models;

using sguees.Repositories;



namespace sguees.Services

{

	public interface ICON_PARTIDAService

	{

		Task<CResult> GetAllAsync(CON_PARTIDAParam xWhere);

		Task<CResult> GetAsync(CON_PARTIDAParam xWhere);

		Task<CResult> CreateAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> UpdateAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> DeleteAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> GetAllAplicarAsync(CON_PARTIDAParam xWhere);

		Task<CResult> AplicarAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> DesAplicarAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> AnularAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> CrearPartidaModeloAsync(CON_PARTIDAParam Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> CrearModeloAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> ImportarExcelAsync(CON_PARTIDA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> GetAllDetaDocAsync(CON_PARTIDAParam xWhere);

		Task<Stream> GetPDFAsync(CON_PARTIDAParam param, string loginSistema);

		Task<CResult> GenerarPartidaLiquidacionAsync(CON_PARTIDAParam param, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> GenerarPartidaCierreAsync(CON_PARTIDAParam param, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> GenerarPartidaAperturaAsync(CON_PARTIDAParam param, string vLOGIN_SISTEMA, string vESTACION);

	}

}


