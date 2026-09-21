using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_PERIODOS_ACADEMICOSRepository : IRepository<ACA_PERIODOS_ACADEMICOSTable>
    {
        Task<CResult> GetCICLO_ACA_PROSPECTOAsync(List<CParameter> xWhere);
    }
}
