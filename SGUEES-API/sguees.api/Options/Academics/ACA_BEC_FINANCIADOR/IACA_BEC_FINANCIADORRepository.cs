using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IACA_BEC_FINANCIADORRepository : IRepository<ACA_BEC_FINANCIADORTable>
    {
        Task<CResult> ActivarInactivarAsync(ACA_BEC_FINANCIADORTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetTiposBecaAsync(int corrEmpresa);
        Task<CResult> GetEntidadesFinanciadorasAsync(int corrEmpresa);
    }
}


