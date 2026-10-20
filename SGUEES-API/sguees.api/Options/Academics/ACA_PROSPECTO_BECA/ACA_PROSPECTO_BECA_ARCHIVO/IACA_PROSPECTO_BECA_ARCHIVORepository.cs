using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_PROSPECTO_BECA_ARCHIVORepository : IRepository<ACA_PROSPECTO_BECA_ARCHIVOTable>
    {
        Task<CResult> GetArchivosAsync(List<CParameter> xWhere);
        Task<CResult> GetArchivoAsync(List<CParameter> xWhere);
    }
}
