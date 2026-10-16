using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IGEN_TIPO_SANGRERepository : IRepository<GEN_TIPO_SANGRETable>
    {
        Task<CResult> GetCORR_TIPO_SANGRE_ACA_PROSPECTOAsync(List<CParameter> xWhere);
    }
}
