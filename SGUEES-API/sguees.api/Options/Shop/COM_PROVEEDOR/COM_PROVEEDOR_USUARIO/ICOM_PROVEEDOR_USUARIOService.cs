using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_PROVEEDOR_USUARIOService
	{
		Task<CResult> GetAllAsync(COM_PROVEEDOR_USUARIOParam xWhere);
		Task<CResult> GetAsync(COM_PROVEEDOR_USUARIOParam xWhere);
		Task<CResult> CreateAsync(COM_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CambioClave(SEG_USUARIO_LOGINParam xWhere,string vLOGIN_SISTEMA, string vESTACION);
	}
}
