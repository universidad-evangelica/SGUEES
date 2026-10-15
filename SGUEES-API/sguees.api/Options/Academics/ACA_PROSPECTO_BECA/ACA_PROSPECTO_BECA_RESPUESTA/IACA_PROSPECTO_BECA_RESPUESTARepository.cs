using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_PROSPECTO_BECA_RESPUESTARepository : IRepository<ACA_PROSPECTO_BECA_RESPUESTATable>
    {
        Task<CResult> GetRespuestasAsync(List<CParameter> xWhere);
    }
}
