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
        // Define la búsqueda de requerimientos organizacionales activos para el lookup del descriptor de puesto.
        Task<List<SC_REQUERIMIENTO_ORGANIZACIONALView>> GetCatalogoDescriptorAsync(int corrEmpresa);
        // Define la verificación de descripción duplicada en la empresa.
        Task<bool> ExistsDescripcionAsync(int corrEmpresa, string descripcion, int excludeCorr);
        // Define el cambio de estado activo/inactivo del requerimiento organizacional.
        Task<CResult> ActivarInactivarAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
