// Qué hace: contrato del repositorio de frecuencia.
// Cómo: extiende IRepository<SC_FRECUENCIATable> y agrega ActivarInactivarAsync y GetFrecuenciasActivasAsync.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_FRECUENCIARepository : IRepository<SC_FRECUENCIATable>
    {
        // Qué hace: define el cambio de estado activo/inactivo de la frecuencia.
        Task<CResult> ActivarInactivarAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: define la consulta de frecuencias activas requerida por el mantenimiento.
        Task<CResult> GetFrecuenciasActivasAsync(List<CParameter> xWhere);
    }
}
