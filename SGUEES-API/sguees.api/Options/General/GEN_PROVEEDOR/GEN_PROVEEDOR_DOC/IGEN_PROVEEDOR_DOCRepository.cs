using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PROVEEDOR_DOCRepository
	{
		Task<CResult> GetAllAsync(List<CParameter> xWhere);
		Task<CResult> GetAsync(List<CParameter> xWhere);
		Task<CResult> CreateAsync(GEN_PROVEEDOR_DOCTable Data);
		Task<CResult> DeleteAsync(GEN_PROVEEDOR_DOCTable Data);
		Task<int> NextCorrDocumentoAsync(int corrEmpresa, int corrProveedor);
	}
}
