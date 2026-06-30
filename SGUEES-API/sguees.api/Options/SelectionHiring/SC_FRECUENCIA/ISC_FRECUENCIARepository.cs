using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_FRECUENCIARepository : IRepository<SC_FRECUENCIATable>
    {
        Task<CResult> GetDistinctValuesAsync(List<CParameter> xWhere);
    }
}
