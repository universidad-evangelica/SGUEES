using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_RESPONSABILIDAD_CARGORepository : IRepository<SC_RESPONSABILIDAD_CARGOTable>
    {
        // Define el cambio de estado activo/inactivo de la responsabilidad de cargo.
        Task<CResult> ActivarInactivarAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<List<SC_RESPONSABILIDAD_CARGOView>> GetCatalogoDescriptorAsync(int corrEmpresa);
        // Define la verificación de unicidad del nombre dentro de la empresa.
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
    }
}
