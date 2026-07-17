using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_DISPONIBILIDAD_HORARIOService
    {
        // Define la consulta del listado de disponibilidades de horario según los filtros recibidos.
        Task<CResult> GetAllAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere);
        // Define la consulta especializada de disponibilidades de horario requerida por el mantenimiento.
        Task<CResult> GetDisponibilidadesActivasAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere);
        // Define la consulta de una disponibilidad de horario específica por sus claves.
        Task<CResult> GetAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere);
        // Define la creación validada de una disponibilidad de horario con su información de auditoría.
        Task<CResult> CreateAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la actualización validada de una disponibilidad de horario con su información de auditoría.
        Task<CResult> UpdateAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la eliminación de una disponibilidad de horario identificada por sus claves.
        Task<CResult> DeleteAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define el cambio de estado activo/inactivo de la disponibilidad de horario.
        Task<CResult> ActivarInactivarAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
