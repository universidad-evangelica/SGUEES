// Contrato del repositorio de requerimiento organizacional.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_REQUERIMIENTO_ORGANIZACIONALRepository : IRepository<SC_REQUERIMIENTO_ORGANIZACIONALTable>
    {
        // Define el cambio de estado activo/inactivo del requerimiento organizacional.
        Task<CResult> ActivarInactivarAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la comprobación de existencia/unicidad requerida por el servicio.
        Task<bool> ExistsDescripcionAsync(int corrEmpresa, string descripcion, int excludeCorr);
        Task<List<SC_REQUERIMIENTO_ORGANIZACIONALView>> GetCatalogoDescriptorAsync(int corrEmpresa);
    }
}
