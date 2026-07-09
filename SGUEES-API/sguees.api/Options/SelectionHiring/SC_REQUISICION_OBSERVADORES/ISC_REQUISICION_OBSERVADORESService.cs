using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISC_REQUISICION_OBSERVADORESService
	{
		Task<CResult> GetAllAsync(SC_REQUISICION_OBSERVADORESParam xWhere);
		Task<CResult> GetAsync(SC_REQUISICION_OBSERVADORESParam xWhere);
		Task<CResult> CreateAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
