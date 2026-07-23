// Qué hace: contrato del servicio de frecuencia.
// Cómo: declara GetAllAsync, GetFrecuenciasActivasAsync, GetAsync, CreateAsync, UpdateAsync, DeleteAsync y ActivarInactivarAsync.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_FRECUENCIAService
    {
        // Qué hace: define la consulta del listado de frecuencias según los filtros recibidos.
        Task<CResult> GetAllAsync(SC_FRECUENCIAParam xWhere);
        // Qué hace: define la consulta de frecuencias activas requerida por el mantenimiento.
        Task<CResult> GetFrecuenciasActivasAsync(SC_FRECUENCIAParam xWhere);
        // Qué hace: define la consulta de una frecuencia específica por sus claves.
        Task<CResult> GetAsync(SC_FRECUENCIAParam xWhere);
        // Qué hace: define la creación validada de una frecuencia con su información de auditoría.
        Task<CResult> CreateAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: define la actualización validada de una frecuencia con su información de auditoría.
        Task<CResult> UpdateAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: define la eliminación de una frecuencia identificada por sus claves.
        Task<CResult> DeleteAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: define el cambio de estado activo/inactivo de la frecuencia.
        Task<CResult> ActivarInactivarAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
