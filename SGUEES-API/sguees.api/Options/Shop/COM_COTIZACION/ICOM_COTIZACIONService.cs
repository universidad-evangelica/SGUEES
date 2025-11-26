using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_COTIZACIONService
	{
		Task<CResult> GetAllAsync(COM_COTIZACIONParam xWhere);
		Task<CResult> GetAsync(COM_COTIZACIONParam xWhere);
		Task<CResult> CreateAsync(COM_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);

		#region "Deta Cotización"
		Task<CResult> GetAllCOM_COTIZACION_DETAAsync(COM_COTIZACION_DETAParam xWhere);
		Task<CResult> GetCOM_COTIZACION_DETAAsync(COM_COTIZACION_DETAParam xWhere);
		Task<CResult> CreateCOM_COTIZACION_DETAAsync(COM_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateCOM_COTIZACION_DETAAsync(COM_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteCOM_COTIZACION_DETAAsync(COM_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		
		#endregion

		//------------------------------//
		Task<CResult> AplicarAsync(COM_COTIZACIONTable Data);
	}
}
