using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_FAMILIARService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_FAMILIARParam xWhere);
        Task<CResult> GetAsync(ACA_PROSPECTO_FAMILIARParam xWhere);
        Task<CResult> CreateAsync(ACA_PROSPECTO_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_PROSPECTO_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_PROSPECTO_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
