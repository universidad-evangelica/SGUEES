using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_SE_OPCIONRepository : IRepository<ACA_SE_OPCIONTable>
    {
        Task<CResult> GetCORR_OPCION_ACA_PROSPECTOAsync(List<CParameter> xWhere);
    }
}
