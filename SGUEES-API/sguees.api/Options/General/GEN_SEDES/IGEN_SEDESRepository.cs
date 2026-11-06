using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IGEN_SEDESRepository : IRepository<GEN_SEDESTable>
    {
        Task<CResult> GetCORR_SEDE_ACA_FACULTADES_SEDESAsync(List<CParameter> xWhere);
    }
}
