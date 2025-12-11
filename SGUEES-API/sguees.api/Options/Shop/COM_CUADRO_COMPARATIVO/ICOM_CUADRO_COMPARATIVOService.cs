using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_CUADRO_COMPARATIVOService
	{
		Task<CResult> GetAllAsync(COM_CUADRO_COMPARATIVOParam xWhere);
		Task<CResult> GetAsync(COM_CUADRO_COMPARATIVOParam xWhere);
		Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		#region "Deta comparativo"
		Task<CResult> UpdateCOM_CUADRO_COMPARATIVO_DETAAsync(COM_CUADRO_COMPARATIVO_DETA_UPDATEDTable Data, string vLOGIN_SISTEMA, string vESTACION);
		#endregion
		// =======================> SOLICITUD COTIZACION <======================= \\
		Task<CResult> GetAllSOLICITUD_COTIZACION_DISPONIBLE(COM_CUADRO_COMPARATIVOParam xWhere);
		Task<CResult> GetAllSOLICITUD_COTIZACION_DETA_DISPONIBLE(COM_CUADRO_COMPARATIVOParam xWhere);
		Task<CResult> getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR(COM_CUADRO_COMPARATIVOParam xWhere);
		Task<CResult> getAllCOM_CUADRO_COMPARATIVO_DETA(COM_CUADRO_COMPARATIVOParam xWhere);
		//------------------------------//
		Task<CResult> COM_CUADRO_COMPARATIVO_GENERAR(COM_CUADRO_COMPARATIVO_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> SolicitarAsync(COM_CUADRO_COMPARATIVOTable Data);
		Task<Stream> GetPDFAsync(COM_CUADRO_COMPARATIVOParam xWhere);
		Task<CResult> AplicarAsync(COM_CUADRO_COMPARATIVOTable Data);
		Task<CResult> GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA(COM_CUADRO_COMPARATIVOParam xWhere);
		Task<CResult> UPDATE_COM_CUADRO_COMPARATIVO_DETAAsync(List<COM_CUADRO_COMPARATIVO_COTIZACION_DETAView>  Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> GetAllSolicitadosAsync(COM_CUADRO_COMPARATIVOParam xWhere);
		Task<CResult> AutorizarAsync(COM_CUADRO_COMPARATIVOTable Data);
		Task<CResult> UpdateAutorizarAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> RechazarAsync(COM_CUADRO_COMPARATIVOTable Data);
	}
}
