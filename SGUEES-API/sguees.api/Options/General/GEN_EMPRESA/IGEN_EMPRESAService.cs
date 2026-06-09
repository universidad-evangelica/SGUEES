using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_EMPRESAService
	{
		Task<CResult> GetAllAsync(GEN_EMPRESAParam xWhere);
		Task<CResult> GetAsync(GEN_EMPRESAParam xWhere);
		Task<CResult> CreateAsync(GEN_EMPRESATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_EMPRESATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateWithImagesAsync(GEN_EMPRESAImagesTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateWithImagesAsync(GEN_EMPRESAImagesTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_EMPRESATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
