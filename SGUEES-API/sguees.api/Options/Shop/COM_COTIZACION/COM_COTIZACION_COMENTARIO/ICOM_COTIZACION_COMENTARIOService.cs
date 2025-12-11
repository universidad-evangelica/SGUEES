using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_COTIZACION_COMENTARIOService
	{
		Task<CResult> GetAllAsync(COM_COTIZACION_COMENTARIOParam xWhere, Int32 TIPO_USUARIO);
		Task<CResult> GetAsync(COM_COTIZACION_COMENTARIOParam xWhere);
		Task<CResult> CreateAsync(COM_COTIZACION_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_COTIZACION_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_COTIZACION_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
