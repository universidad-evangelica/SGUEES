using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_RUBRO_SUMAService
	{
		Task<CResult> GetAllAsync(GEN_RUBRO_SUMAParam xWhere);
		Task<CResult> GetAsync(GEN_RUBRO_SUMAParam xWhere);
		Task<CResult> CreateAsync(GEN_RUBRO_SUMATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_RUBRO_SUMATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_RUBRO_SUMATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
