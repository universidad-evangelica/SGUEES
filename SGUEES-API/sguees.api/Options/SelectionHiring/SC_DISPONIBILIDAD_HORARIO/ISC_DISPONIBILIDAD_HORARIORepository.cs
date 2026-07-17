// Contrato del repositorio de disponibilidad de horario.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_DISPONIBILIDAD_HORARIORepository : IRepository<SC_DISPONIBILIDAD_HORARIOTable>
    {
        // Define el cambio de estado activo/inactivo de la disponibilidad de horario.
        Task<CResult> ActivarInactivarAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la consulta especializada de disponibilidades de horario requerida por el mantenimiento.
        Task<CResult> GetDisponibilidadesActivasAsync(List<CParameter> xWhere);
    }
}
