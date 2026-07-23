// Contrato del servicio de riesgo del puesto.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_RIESGO_PUESTOService
    {
        // Define la consulta del catálogo activo para el descriptor de puesto.
        Task<CResult> GetCatalogoDescriptorAsync(SC_RIESGO_PUESTOParam xWhere);
        // Define la consulta del listado de riesgos del puesto según los filtros recibidos.
        Task<CResult> GetAllAsync(SC_RIESGO_PUESTOParam xWhere);
        // Define la consulta de un riesgo del puesto específico por sus claves.
        Task<CResult> GetAsync(SC_RIESGO_PUESTOParam xWhere);
        // Define la creación validada de un riesgo del puesto con su información de auditoría.
        Task<CResult> CreateAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la actualización validada de un riesgo del puesto con su información de auditoría.
        Task<CResult> UpdateAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la eliminación de un riesgo del puesto identificado por sus claves.
        Task<CResult> DeleteAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define el cambio de estado activo/inactivo del riesgo del puesto.
        Task<CResult> ActivarInactivarAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
