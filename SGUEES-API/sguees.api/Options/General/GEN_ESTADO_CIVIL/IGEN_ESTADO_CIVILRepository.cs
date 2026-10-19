using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IGEN_ESTADO_CIVILRepository : IRepository<GEN_ESTADO_CIVILTable>
    {
        Task<CResult> GetCORR_ESTADO_CIVIL_ACA_PROSPECTOAsync(List<CParameter> xWhere);
    }
}
