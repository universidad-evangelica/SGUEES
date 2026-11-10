using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PROVEEDOR_USUARIOService
	{
		Task<CResult> GetAllAsync(GEN_PROVEEDOR_USUARIOParam xWhere);
		Task<CResult> GetAsync(GEN_PROVEEDOR_USUARIOParam xWhere);
		Task<CResult> CreateAsync(GEN_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CambioClaveAsync(GEN_PROVEEDOR_USUARIO_CLAVEParam Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
