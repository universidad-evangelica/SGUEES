using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTOService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTOParam xWhere);
        Task<CResult> GetAsync(ACA_PROSPECTOParam xWhere);
        Task<CResult> CreateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
