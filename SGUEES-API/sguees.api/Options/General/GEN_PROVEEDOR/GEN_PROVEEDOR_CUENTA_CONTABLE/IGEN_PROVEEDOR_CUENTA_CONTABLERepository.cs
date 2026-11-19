using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PROVEEDOR_CUENTA_CONTABLERepository
	{
		Task<CResult> GetAllAsync(List<CParameter> xWhere);
		Task<CResult> GetAsync(List<CParameter> xWhere);
		Task<CResult> CreateAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
