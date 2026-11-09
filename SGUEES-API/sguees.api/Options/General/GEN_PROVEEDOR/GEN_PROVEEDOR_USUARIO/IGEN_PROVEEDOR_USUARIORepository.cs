using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PROVEEDOR_USUARIORepository
	{
		Task<CResult> GetAllAsync(List<CParameter> xWhere);
		Task<CResult> GetAsync(List<CParameter> xWhere);
		Task<CResult> CreateLinkAsync(GEN_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> TouchLinkAsync(GEN_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteLinkAsync(GEN_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
