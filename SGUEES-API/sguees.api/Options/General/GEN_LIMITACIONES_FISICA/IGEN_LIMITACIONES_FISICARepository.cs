using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IGEN_LIMITACIONES_FISICARepository : IRepository<GEN_LIMITACIONES_FISICATable>
    {
        Task<CResult> GetCORR_LIMITACION_FISICA_ACA_PROSPECTOAsync(List<CParameter> xWhere);
    }
}
