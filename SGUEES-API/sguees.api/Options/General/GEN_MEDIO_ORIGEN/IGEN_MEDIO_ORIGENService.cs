using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IGEN_MEDIO_ORIGENService
    {
        Task<CResult> GetAllAsync(GEN_MEDIO_ORIGENParam xWhere);
        Task<CResult> GetAsync(GEN_MEDIO_ORIGENParam xWhere);
        Task<CResult> CreateAsync(GEN_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(GEN_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(GEN_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetCORR_MEDIO_ORIGEN_ACA_PROSPECTOAsync(GEN_MEDIO_ORIGENParam xWhere);
    }
}
