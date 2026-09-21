using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_DEPORTACIONService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_DEPORTACIONParam xWhere);
        Task<CResult> GetAsync(ACA_PROSPECTO_DEPORTACIONParam xWhere);
        Task<CResult> CreateAsync(ACA_PROSPECTO_DEPORTACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_PROSPECTO_DEPORTACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_PROSPECTO_DEPORTACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
