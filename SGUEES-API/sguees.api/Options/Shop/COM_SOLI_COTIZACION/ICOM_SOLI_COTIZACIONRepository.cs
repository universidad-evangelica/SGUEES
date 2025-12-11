using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_SOLI_COTIZACIONRepository: IRepository<COM_SOLI_COTIZACIONTable>
	{
		// =======================> SOLICITUD DE COMPRA DISPONIBLE <======================= \\
		Task<CResult> GetAllSOLICITUD_COMPRAS_DISPONIBLE(List<CParameter> xWhere);
		Task<CResult> GetAllSOLICITUD_COMPRAS_DETA_DISPONIBLE(List<CParameter> xWhere);
		// Task<CResult> CreateEncaDetaAsync(COM_SOLI_COTIZACION_ENCA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Task<CResult> UpdateEncaDetaAsync(COM_SOLI_COTIZACION_ENCA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> SolicitarAsync(COM_SOLI_COTIZACIONTable Data);
		Task<CResult> GetComSoliCotizacionImpr(List<CParameter> xWhere);
		Task<CResult> AnularAsync(COM_SOLI_COTIZACIONTable Data);
		Task<CResult> AplicarAsync(COM_SOLI_COTIZACIONTable Data);
		Task<CResult> GetAllCotizacionesAsync(List<CParameter> xWhere);
	}
}
