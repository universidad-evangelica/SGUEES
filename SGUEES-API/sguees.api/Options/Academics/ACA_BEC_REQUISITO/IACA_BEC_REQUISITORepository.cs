using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IACA_BEC_REQUISITORepository : IRepository<ACA_BEC_REQUISITOTable>
    {
        Task<CResult> ActivarInactivarAsync(ACA_BEC_REQUISITOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetTiposBecaAsync(int corrEmpresa);
    }
}
