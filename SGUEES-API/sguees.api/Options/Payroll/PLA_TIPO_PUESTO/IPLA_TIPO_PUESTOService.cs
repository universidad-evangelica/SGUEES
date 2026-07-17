using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface IPLA_TIPO_PUESTOService
    {
        // Define la consulta del listado de tipos de puesto según los filtros recibidos.
        Task<CResult> GetAllAsync(PLA_TIPO_PUESTOParam xWhere);
        // Define la consulta de un tipo de puesto específico por sus claves.
        Task<CResult> GetAsync(PLA_TIPO_PUESTOParam xWhere);
        // Define la creación validada de un tipo de puesto con su información de auditoría.
        Task<CResult> CreateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la actualización validada de un tipo de puesto con su información de auditoría.
        Task<CResult> UpdateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la eliminación de un tipo de puesto identificado por sus claves.
        Task<CResult> DeleteAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define el cambio de estado activo/inactivo del tipo de puesto.
        Task<CResult> ActivarInactivarAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
