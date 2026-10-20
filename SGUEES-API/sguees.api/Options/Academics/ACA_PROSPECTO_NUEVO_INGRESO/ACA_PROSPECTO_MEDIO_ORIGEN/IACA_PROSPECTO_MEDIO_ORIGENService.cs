using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_MEDIO_ORIGENService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_MEDIO_ORIGENParam xWhere);
        Task<CResult> GetAsync(ACA_PROSPECTO_MEDIO_ORIGENParam xWhere);
        Task<CResult> CreateAsync(ACA_PROSPECTO_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_PROSPECTO_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_PROSPECTO_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
