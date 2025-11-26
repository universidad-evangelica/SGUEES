using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_SOLI_COTIZACION_DETAService
	{
		Task<CResult> GetAllAsync(COM_SOLI_COTIZACION_DETAParam xWhere);
		Task<CResult> GetAsync(COM_SOLI_COTIZACION_DETAParam xWhere);
		Task<CResult> CreateAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
