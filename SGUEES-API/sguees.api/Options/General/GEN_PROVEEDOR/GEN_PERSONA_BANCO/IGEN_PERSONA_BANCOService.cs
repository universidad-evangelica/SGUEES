using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PERSONA_BANCOService
	{
		Task<CResult> GetAllAsync(GEN_PERSONA_BANCOParam xWhere);
		Task<CResult> GetAsync(GEN_PERSONA_BANCOParam xWhere);
		Task<CResult> CreateAsync(GEN_PERSONA_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_PERSONA_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_PERSONA_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
