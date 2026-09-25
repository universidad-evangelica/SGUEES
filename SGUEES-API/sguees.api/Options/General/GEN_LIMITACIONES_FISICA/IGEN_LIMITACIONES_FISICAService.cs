using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IGEN_LIMITACIONES_FISICAService
    {
        Task<CResult> GetAllAsync(GEN_LIMITACIONES_FISICAParam xWhere);
        Task<CResult> GetAsync(GEN_LIMITACIONES_FISICAParam xWhere);
        Task<CResult> CreateAsync(GEN_LIMITACIONES_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(GEN_LIMITACIONES_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(GEN_LIMITACIONES_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetCORR_LIMITACION_FISICA_ACA_PROSPECTOAsync(GEN_LIMITACIONES_FISICAParam xWhere);
    }
}
