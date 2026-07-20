using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISEG_OPCION_SISTEMAService
	{
		Task<CResult> GetAllAsync(SEG_OPCION_SISTEMAParam xWhere);
		Task<CResult> GetAsync(SEG_OPCION_SISTEMAParam xWhere);
		Task<CResult> CreateAsync(SEG_OPCION_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SEG_OPCION_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SEG_OPCION_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
