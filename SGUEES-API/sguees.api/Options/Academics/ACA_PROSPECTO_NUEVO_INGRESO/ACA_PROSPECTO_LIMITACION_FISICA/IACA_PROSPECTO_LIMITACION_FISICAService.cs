using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_LIMITACION_FISICAService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_LIMITACION_FISICAParam xWhere);
        Task<CResult> GetAsync(ACA_PROSPECTO_LIMITACION_FISICAParam xWhere);
        Task<CResult> CreateAsync(ACA_PROSPECTO_LIMITACION_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_PROSPECTO_LIMITACION_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_PROSPECTO_LIMITACION_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
