using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PARAMETROService
	{
		Task<CResult> GetAllAsync(GEN_PARAMETROParam xWhere);
		Task<CResult> GetAsync(GEN_PARAMETROParam xWhere);
		Task<CResult> CreateAsync(GEN_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
