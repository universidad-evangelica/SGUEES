using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_REQUERIMIENTO_ORGANIZACIONALRepository : IRepository<SC_REQUERIMIENTO_ORGANIZACIONALTable>
    {
        Task<CResult> GetDistinctValuesAsync(List<CParameter> xWhere);
        Task<bool> ExistsDescripcionAsync(int corrEmpresa, string descripcion, int excludeCorr);
        Task<List<SC_REQUERIMIENTO_ORGANIZACIONALView>> GetCatalogoDescriptorAsync(int corrEmpresa);
    }
}
