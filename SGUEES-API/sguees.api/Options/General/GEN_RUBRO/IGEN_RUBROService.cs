using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_RUBROService
	{
		Task<CResult> GetAllAsync(GEN_RUBROParam xWhere);
		Task<CResult> GetAsync(GEN_RUBROParam xWhere);
		Task<CResult> CreateAsync(GEN_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetLookUpAsync(GEN_RUBROParam xWhere);
	}
}
