// Contrato del repositorio de competencias técnicas.
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SGUEES.Repositories
{
    public interface ISC_COMPETENCIAS_TECNICASRepository : IRepository<SC_COMPETENCIAS_TECNICASTable>
    {
        Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
        Task<List<SC_COMPETENCIAS_TECNICASView>> GetPadresByNivelAsync(int corrEmpresa, string nivel, bool? soloActivos);
        Task<List<SC_COMPETENCIAS_TECNICASView>> GetCatalogoNivel3DescriptorAsync(int corrEmpresa);
        Task<List<string>> GetSiblingCodigosLevel3Async(int corrEmpresa, int corrPadre, string parentCodigoPrefix);
        Task<bool> HasChildrenAsync(int corrEmpresa, int corrCompetencia);
    }
}
