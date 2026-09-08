using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface IACA_BEC_FINANCIADORService
    {
        Task<CResult> GetAllAsync(ACA_BEC_FINANCIADORParam xWhere);
        Task<CResult> GetAsync(ACA_BEC_FINANCIADORParam xWhere);
        Task<CResult> CreateAsync(ACA_BEC_FINANCIADORTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_BEC_FINANCIADORTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_BEC_FINANCIADORTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> ActivarInactivarAsync(ACA_BEC_FINANCIADORTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetTiposBecaAsync(int corrEmpresa);
        Task<CResult> GetEntidadesFinanciadorasAsync(int corrEmpresa);
    }
}


