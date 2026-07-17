using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_IMPACTO_ECONOMICOService
    {
        // Define la consulta del catálogo activo para el descriptor de puesto.
        Task<CResult> GetCatalogoDescriptorAsync(SC_IMPACTO_ECONOMICOParam xWhere);
        // Define la consulta del listado de impactos económicos según los filtros recibidos.
        Task<CResult> GetAllAsync(SC_IMPACTO_ECONOMICOParam xWhere);
        // Define la consulta de un impacto económico específico por sus claves.
        Task<CResult> GetAsync(SC_IMPACTO_ECONOMICOParam xWhere);
        // Define la creación validada de un impacto económico con su información de auditoría.
        Task<CResult> CreateAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la actualización validada de un impacto económico con su información de auditoría.
        Task<CResult> UpdateAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la eliminación de un impacto económico identificado por sus claves.
        Task<CResult> DeleteAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define el cambio de estado activo/inactivo del impacto económico.
        Task<CResult> ActivarInactivarAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
