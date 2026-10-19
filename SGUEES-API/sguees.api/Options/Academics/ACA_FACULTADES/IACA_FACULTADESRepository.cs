using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_FACULTADESRepository : IRepository<ACA_FACULTADESTable>
    {
        Task<CResult> ActivarInactivarAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
