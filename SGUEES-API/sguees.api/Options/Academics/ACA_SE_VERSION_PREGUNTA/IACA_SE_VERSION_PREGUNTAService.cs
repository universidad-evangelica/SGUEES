using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IACA_SE_VERSION_PREGUNTAService
	{
		Task<CResult> GetAllAsync(ACA_SE_VERSION_PREGUNTAParam xWhere);
		Task<CResult> GetAsync(ACA_SE_VERSION_PREGUNTAParam xWhere);
		Task<CResult> CreateAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
