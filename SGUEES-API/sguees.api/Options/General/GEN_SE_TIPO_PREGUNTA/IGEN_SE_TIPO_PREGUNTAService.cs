using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_SE_TIPO_PREGUNTAService
	{
		Task<CResult> GetAllAsync(GEN_SE_TIPO_PREGUNTAParam xWhere);
		Task<CResult> GetAsync(GEN_SE_TIPO_PREGUNTAParam xWhere);
		Task<CResult> CreateAsync(GEN_SE_TIPO_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_SE_TIPO_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_SE_TIPO_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_SE_TIPO_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetTiposActivosAsync();
	}
}
