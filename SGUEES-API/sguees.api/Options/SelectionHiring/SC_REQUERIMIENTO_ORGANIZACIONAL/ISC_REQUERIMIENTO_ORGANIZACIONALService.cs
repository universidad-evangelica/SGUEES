// Contrato del servicio de requerimiento organizacional.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_REQUERIMIENTO_ORGANIZACIONALService
    {
        // Define la consulta del listado de requerimientos organizacionales según los filtros recibidos.
        Task<CResult> GetAllAsync(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere);
        // Define la consulta de un requerimiento organizacional específico por sus claves.
        Task<CResult> GetAsync(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere);
        // Define la creación validada de un requerimiento organizacional con su información de auditoría.
        Task<CResult> CreateAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la actualización validada de un requerimiento organizacional con su información de auditoría.
        Task<CResult> UpdateAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la eliminación de un requerimiento organizacional identificado por sus claves.
        Task<CResult> DeleteAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define el cambio de estado activo/inactivo del requerimiento organizacional.
        Task<CResult> ActivarInactivarAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la consulta del catálogo activo para el descriptor de puesto.
        Task<CResult> GetCatalogoDescriptorAsync(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere);
    }
}
