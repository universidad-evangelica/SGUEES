using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IPLA_DEPARTAMENTOService
	{
		Task<CResult> GetAllAsync(PLA_DEPARTAMENTOParam xWhere);
		Task<CResult> GetAsync(PLA_DEPARTAMENTOParam xWhere);
		Task<CResult> CreateAsync(PLA_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(PLA_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(PLA_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
