using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IGEN_TIPO_SANGREService
    {
        Task<CResult> GetAllAsync(GEN_TIPO_SANGREParam xWhere);
        Task<CResult> GetAsync(GEN_TIPO_SANGREParam xWhere);
        Task<CResult> CreateAsync(GEN_TIPO_SANGRETable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(GEN_TIPO_SANGRETable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(GEN_TIPO_SANGRETable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetCORR_TIPO_SANGRE_ACA_PROSPECTOAsync(GEN_TIPO_SANGREParam xWhere);
    }
}
