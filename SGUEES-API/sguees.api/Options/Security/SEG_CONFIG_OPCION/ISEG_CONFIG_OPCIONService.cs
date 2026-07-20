using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISEG_CONFIG_OPCIONService
	{
		Task<CResult> GetAllAsync(SEG_CONFIG_OPCIONParam xWhere);
		Task<CResult> GetAsync(SEG_CONFIG_OPCIONParam xWhere);
		Task<CResult> CreateAsync(SEG_CONFIG_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SEG_CONFIG_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SEG_CONFIG_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
