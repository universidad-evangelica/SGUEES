using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PROVEEDOR_CUENTA_CONTABLEService
	{
		Task<CResult> GetAllAsync(GEN_PROVEEDOR_CUENTA_CONTABLEParam xWhere);
		Task<CResult> GetAsync(GEN_PROVEEDOR_CUENTA_CONTABLEParam xWhere);
		Task<CResult> CreateAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
