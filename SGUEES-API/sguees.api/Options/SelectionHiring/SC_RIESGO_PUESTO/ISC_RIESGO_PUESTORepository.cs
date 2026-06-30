using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_RIESGO_PUESTORepository : IRepository<SC_RIESGO_PUESTOTable>
    {
        Task<CResult> GetDistinctValuesAsync(List<CParameter> xWhere);
    }
}
