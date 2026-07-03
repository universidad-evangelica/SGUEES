using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_RESPONSABILIDAD_CARGORepository : IRepository<SC_RESPONSABILIDAD_CARGOTable>
    {
        Task<CResult> GetDistinctValuesAsync(List<CParameter> xWhere);
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
    }
}
