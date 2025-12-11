using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_SOLI_COTIZACIONService
	{
		Task<CResult> GetAllAsync(COM_SOLI_COTIZACIONParam xWhere);
		Task<CResult> GetAsync(COM_SOLI_COTIZACIONParam xWhere);
		Task<CResult> CreateAsync(COM_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateEncaDetaAsync(COM_SOLI_COTIZACION_ENCA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateEncaDetaAsync(COM_SOLI_COTIZACION_ENCA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// =======================> Deta Solicitud <======================= \\
		#region "Deta Solicitud"
		Task<CResult> GetAllCOM_SOLI_COTIZACION_DETAAsync(COM_SOLI_COTIZACION_DETAParam xWhere);
		Task<CResult> GetCOM_SOLI_COTIZACION_DETAAsync(COM_SOLI_COTIZACION_DETAParam xWhere);
		Task<CResult> CreateCOM_SOLI_COTIZACION_DETAAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateCOM_SOLI_COTIZACION_DETAAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteCOM_SOLI_COTIZACION_DETAAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AnularDetaAsync(COM_SOLI_COTIZACION_DETATable Data);
		#endregion
		// =======================> PROVEEDOR Solicitud <======================= \\
		#region "Proveedor Solicitud"
		Task<CResult> GetAllCOM_SOLI_COTIZACION_PROVEEDOR(COM_SOLI_COTIZACION_PROVEEDORParam xWhere);
		Task<CResult> GetCOM_SOLI_COTIZACION_PROVEEDOR(COM_SOLI_COTIZACION_PROVEEDORParam xWhere);
		Task<CResult> CreateCOM_SOLI_COTIZACION_PROVEEDORAsync(List<COM_SOLI_COTIZACION_PROVEEDORView> Data, string vLOGIN_SISTEMA, string vESTACION, int CORR_EMPRESA);
		Task<CResult> UpdateCOM_SOLI_COTIZACION_PROVEEDORAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteCOM_SOLI_COTIZACION_PROVEEDORAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAllPROVEEDOR_DISPONIBLE(COM_SOLI_COTIZACION_PROVEEDORParam xWhere);
		Task<CResult> AnularCOM_SOLI_COTIZACION_PROVEEDORAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> HabilitarCOM_SOLI_COTIZACION_PROVEEDORAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		#endregion

		// =======================> SOLICITUD COMPRA <======================= \\
		Task<CResult> GetAllSOLICITUD_COMPRAS_DISPONIBLE(COM_SOLI_COTIZACIONParam xWhere);
		Task<CResult> GetAllSOLICITUD_COMPRAS_DETA_DISPONIBLE(COM_SOLI_COTIZACIONParam xWhere);

		//------------------------------//
		Task<CResult> SolicitarAsync(COM_SOLI_COTIZACIONTable Data);
		Task<Stream> GetPDFAsync(COM_SOLI_COTIZACIONParam xWhere);
		Task<CResult> AnularAsync(COM_SOLI_COTIZACIONTable Data);
		Task<CResult> AplicarAsync(COM_SOLI_COTIZACIONTable Data);
	}
}
