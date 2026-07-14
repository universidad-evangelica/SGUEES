using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_DISPONIBILIDAD_HORARIORepository : IRepository<SC_DISPONIBILIDAD_HORARIOTable>
    {
        Task<CResult> GetDistinctValuesAsync(List<CParameter> xWhere);
        Task<CResult> GetDisponibilidadesActivasAsync(List<CParameter> xWhere);
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
    }
}
