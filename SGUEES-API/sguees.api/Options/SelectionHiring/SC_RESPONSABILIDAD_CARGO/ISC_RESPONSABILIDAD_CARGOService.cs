using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_RESPONSABILIDAD_CARGOService
    {
        // Define la consulta del listado de responsabilidades de cargo según los filtros recibidos.
        Task<CResult> GetAllAsync(SC_RESPONSABILIDAD_CARGOParam xWhere);
        // Define la consulta del catálogo activo para el descriptor de puesto.
        Task<CResult> GetCatalogoDescriptorAsync(SC_RESPONSABILIDAD_CARGOParam xWhere);
        // Define la consulta de una responsabilidad de cargo específica por sus claves.
        Task<CResult> GetAsync(SC_RESPONSABILIDAD_CARGOParam xWhere);
        // Define la creación validada de una responsabilidad de cargo con su información de auditoría.
        Task<CResult> CreateAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la actualización validada de una responsabilidad de cargo con su información de auditoría.
        Task<CResult> UpdateAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la eliminación de una responsabilidad de cargo identificada por sus claves.
        Task<CResult> DeleteAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define el cambio de estado activo/inactivo de la responsabilidad de cargo.
        Task<CResult> ActivarInactivarAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
