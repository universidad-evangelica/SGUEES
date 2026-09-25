using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IGEN_MEDIO_ORIGENRepository : IRepository<GEN_MEDIO_ORIGENTable>
    {
        Task<CResult> GetCORR_MEDIO_ORIGEN_ACA_PROSPECTOAsync(List<CParameter> xWhere);
    }
}
