using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Contrato del servicio de mantenimiento de tipo de puesto.
    public interface IPLA_TIPO_PUESTOService
    {
        // Lista tipos de puesto de la empresa.
        Task<CResult> GetAllAsync(PLA_TIPO_PUESTOParam xWhere);
        // Obtiene un tipo por filtros.
        Task<CResult> GetAsync(PLA_TIPO_PUESTOParam xWhere);
        // Crea un tipo tras validar datos y unicidad.
        Task<CResult> CreateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Actualiza un tipo existente.
        Task<CResult> UpdateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Elimina un tipo si no tiene dependencias.
        Task<CResult> DeleteAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Cambia el estado activo/inactivo.
        Task<CResult> ActivarInactivarAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
