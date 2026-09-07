using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IACA_BEC_ORIGEN_BECARepository : IRepository<ACA_BEC_ORIGEN_BECATable>
    {
        Task<CResult> ActivarInactivarAsync(ACA_BEC_ORIGEN_BECATable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
