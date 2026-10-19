using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IGEN_SEXORepository : IRepository<GEN_SEXOTable>
    {
        Task<CResult> GetCORR_SEXO_ACA_PROSPECTOAsync(List<CParameter> xWhere);
    }
}
