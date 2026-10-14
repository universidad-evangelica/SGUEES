using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IGEN_SEXOService
    {
        Task<CResult> GetAllAsync(GEN_SEXOParam xWhere);
        Task<CResult> GetAsync(GEN_SEXOParam xWhere);
        Task<CResult> CreateAsync(GEN_SEXOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(GEN_SEXOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(GEN_SEXOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetCORR_SEXO_ACA_PROSPECTOAsync(GEN_SEXOParam xWhere);
    }
}
