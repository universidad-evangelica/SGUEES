using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_ACTIVIDAD_ECONOMICAService
	{
		Task<CResult> GetAllAsync(GEN_ACTIVIDAD_ECONOMICAParam xWhere);
		Task<CResult> GetAsync(GEN_ACTIVIDAD_ECONOMICAParam xWhere);
		Task<CResult> CreateAsync(GEN_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
