using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Qué hace: define el contrato del servicio de mantenimiento de tipo de puesto.
    public interface IPLA_TIPO_PUESTOService
    {
        // Qué hace: lista tipos de puesto de la empresa.
        Task<CResult> GetAllAsync(PLA_TIPO_PUESTOParam xWhere);
        // Qué hace: obtiene un tipo de puesto por filtros.
        Task<CResult> GetAsync(PLA_TIPO_PUESTOParam xWhere);
        // Qué hace: crea un tipo de puesto tras validar datos y unicidad.
        Task<CResult> CreateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: actualiza un tipo de puesto existente.
        Task<CResult> UpdateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: elimina un tipo de puesto si no tiene dependencias.
        Task<CResult> DeleteAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: cambia el estado activo/inactivo.
        Task<CResult> ActivarInactivarAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
