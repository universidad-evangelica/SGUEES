using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_SE_OPCIONService
    {
        Task<CResult> GetAllAsync(ACA_SE_OPCIONParam xWhere);
        Task<CResult> GetAsync(ACA_SE_OPCIONParam xWhere);
        Task<CResult> CreateAsync(ACA_SE_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_SE_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_SE_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetCORR_OPCION_ACA_PROSPECTOAsync(ACA_SE_OPCIONParam xWhere);
    }
}
