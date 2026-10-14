using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IGEN_ESTADO_CIVILService
    {
        Task<CResult> GetAllAsync(GEN_ESTADO_CIVILParam xWhere);
        Task<CResult> GetAsync(GEN_ESTADO_CIVILParam xWhere);
        Task<CResult> CreateAsync(GEN_ESTADO_CIVILTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(GEN_ESTADO_CIVILTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(GEN_ESTADO_CIVILTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetCORR_ESTADO_CIVIL_ACA_PROSPECTOAsync(GEN_ESTADO_CIVILParam xWhere);
    }
}
