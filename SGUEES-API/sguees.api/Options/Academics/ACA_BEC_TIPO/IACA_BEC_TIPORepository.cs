using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IACA_BEC_TIPORepository : IRepository<ACA_BEC_TIPOTable>
    {
        Task<CResult> ActivarInactivarAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetOrigenesAsync(int corrEmpresa);
        Task<CResult> GetConveniosAsync(int corrEmpresa);
    }
}
