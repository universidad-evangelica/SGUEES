using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IPLA_NIVEL_ACADEMICORepository : IRepository<PLA_NIVEL_ACADEMICOTable>
    {
        Task<CResult> GetDistinctValuesAsync(List<CParameter> xWhere);
    }
}
