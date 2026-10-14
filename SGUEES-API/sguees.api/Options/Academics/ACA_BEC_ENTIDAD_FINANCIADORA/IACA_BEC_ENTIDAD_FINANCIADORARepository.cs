using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IACA_BEC_ENTIDAD_FINANCIADORARepository : IRepository<ACA_BEC_ENTIDAD_FINANCIADORATable>
    {
        Task<CResult> ActivarInactivarAsync(ACA_BEC_ENTIDAD_FINANCIADORATable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}

