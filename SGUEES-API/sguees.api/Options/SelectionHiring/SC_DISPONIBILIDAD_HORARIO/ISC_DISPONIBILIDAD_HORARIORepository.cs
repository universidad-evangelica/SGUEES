// Qué hace: contrato del repositorio de disponibilidad de horario.
// Cómo: extiende IRepository<SC_DISPONIBILIDAD_HORARIOTable> y agrega ActivarInactivarAsync y GetDisponibilidadesActivasAsync.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_DISPONIBILIDAD_HORARIORepository : IRepository<SC_DISPONIBILIDAD_HORARIOTable>
    {
        // Qué hace: define el cambio de estado activo/inactivo de la disponibilidad de horario.
        Task<CResult> ActivarInactivarAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: define la consulta de disponibilidades de horario activas requerida por el mantenimiento.
        Task<CResult> GetDisponibilidadesActivasAsync(List<CParameter> xWhere);
    }
}
