using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SGUEES.Repositories
{
    public interface ISC_COMPETENCIAS_TECNICASRepository : IRepository<SC_COMPETENCIAS_TECNICASTable>
    {
        Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
        Task<List<SC_COMPETENCIAS_TECNICASView>> GetPadresByNivelAsync(int corrEmpresa, string nivel, bool? soloActivos);
        Task<List<string>> GetSiblingCodigosLevel3Async(int corrEmpresa, int corrPadre, string parentCodigoPrefix);
        Task<bool> HasChildrenAsync(int corrEmpresa, int corrCompetencia);
        Task<CResult> GetDistinctValuesAsync(List<CParameter> xWhere);
    }
}
