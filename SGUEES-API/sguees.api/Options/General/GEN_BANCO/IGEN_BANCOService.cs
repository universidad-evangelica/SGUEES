using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public interface IGEN_BANCOService
	{
		Task<CResult> GetAllAsync(GEN_BANCOParam xWhere);
		Task<CResult> GetAsync(GEN_BANCOParam xWhere);
		Task<CResult> CreateAsync(GEN_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
