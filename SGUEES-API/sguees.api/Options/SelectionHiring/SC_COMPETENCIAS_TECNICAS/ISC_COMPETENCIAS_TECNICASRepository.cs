using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SGUEES.Repositories
{
    public interface ISC_COMPETENCIAS_TECNICASRepository : IRepository<SC_COMPETENCIAS_TECNICASTable>
    {
        // Define el cambio de estado activo/inactivo de la competencia técnica.
        Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la verificación de unicidad del código dentro de la empresa.
        Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
        Task<List<SC_COMPETENCIAS_TECNICASView>> GetPadresByNivelAsync(int corrEmpresa, string nivel, bool? soloActivos);
        Task<List<SC_COMPETENCIAS_TECNICASView>> GetCatalogoNivel3DescriptorAsync(int corrEmpresa);
        Task<List<string>> GetSiblingCodigosLevel3Async(int corrEmpresa, int corrPadre, string parentCodigoPrefix);
        Task<bool> HasChildrenAsync(int corrEmpresa, int corrCompetencia);
    }
}
