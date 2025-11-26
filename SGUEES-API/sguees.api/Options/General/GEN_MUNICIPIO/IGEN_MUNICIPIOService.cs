using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface IGEN_MUNICIPIOService
	{
		Task<CResult> GetAllAsync(GEN_MUNICIPIOParam xWhere);
		Task<CResult> GetAsync(GEN_MUNICIPIOParam xWhere);
		Task<CResult> CreateAsync(GEN_MUNICIPIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_MUNICIPIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_MUNICIPIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
