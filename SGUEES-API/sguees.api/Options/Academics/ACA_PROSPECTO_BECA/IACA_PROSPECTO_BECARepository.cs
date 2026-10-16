using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_PROSPECTO_BECARepository : IRepository<ACA_PROSPECTO_BECATable>
    {
        Task<CResult> GetRespuestasAsync(List<CParameter> xWhere);
        Task<CResult> GetArchivosAsync(List<CParameter> xWhere);
        Task<CResult> GetArchivoAsync(List<CParameter> xWhere);
    }
}
