// Contrato del servicio de competencias técnicas.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_COMPETENCIAS_TECNICASService
    {
        // Define la consulta del listado de competencias técnicas según los filtros recibidos.
        Task<CResult> GetAllAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        // Define la consulta de una competencia técnica específica por sus claves.
        Task<CResult> GetAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        // Define la consulta de posibles padres para la jerarquía.
        Task<CResult> GetPadresAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        // Define el catálogo de nivel tres para el descriptor de puesto.
        Task<CResult> GetCatalogoNivel3DescriptorAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        // Define el cálculo del siguiente código según el padre.
        Task<CResult> GetNextCodigoAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        // Define la creación validada de una competencia técnica con su información de auditoría.
        Task<CResult> CreateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la actualización validada de una competencia técnica con su información de auditoría.
        Task<CResult> UpdateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la eliminación de una competencia técnica identificada por sus claves.
        Task<CResult> DeleteAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define el cambio de estado activo/inactivo de la competencia técnica.
        Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
