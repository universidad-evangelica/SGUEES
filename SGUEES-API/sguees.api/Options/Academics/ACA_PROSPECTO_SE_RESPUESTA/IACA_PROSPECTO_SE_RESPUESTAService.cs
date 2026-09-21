using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_SE_RESPUESTAService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_SE_RESPUESTAParam xWhere);
        Task<CResult> GetAsync(ACA_PROSPECTO_SE_RESPUESTAParam xWhere);
        Task<CResult> CreateAsync(ACA_PROSPECTO_SE_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_PROSPECTO_SE_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_PROSPECTO_SE_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
