// Contrato del servicio de impacto económico.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_IMPACTO_ECONOMICOService
    {
        // Define la consulta del catálogo activo para el descriptor de puesto.
        Task<CResult> GetCatalogoDescriptorAsync(SC_IMPACTO_ECONOMICOParam xWhere);
        // Define la consulta del listado según los filtros recibidos.
        Task<CResult> GetAllAsync(SC_IMPACTO_ECONOMICOParam xWhere);
        // Define la consulta de un registro específico por sus claves.
        Task<CResult> GetAsync(SC_IMPACTO_ECONOMICOParam xWhere);
        // Define la creación validada con su información de auditoría.
        Task<CResult> CreateAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la actualización validada con su información de auditoría.
        Task<CResult> UpdateAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la eliminación identificada por sus claves.
        Task<CResult> DeleteAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define el cambio de estado activo/inactivo del registro.
        Task<CResult> ActivarInactivarAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
