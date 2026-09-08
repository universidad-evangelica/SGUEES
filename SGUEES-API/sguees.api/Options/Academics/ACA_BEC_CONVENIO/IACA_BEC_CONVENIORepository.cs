using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IACA_BEC_CONVENIORepository : IRepository<ACA_BEC_CONVENIOTable>
    {
        Task<CResult> ActivarInactivarAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetEntidadesFinanciadorasAsync(int corrEmpresa);
    }
}


