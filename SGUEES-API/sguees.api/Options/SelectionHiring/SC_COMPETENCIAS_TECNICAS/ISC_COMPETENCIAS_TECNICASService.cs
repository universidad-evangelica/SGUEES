// Qué hace: contrato del servicio de competencias técnicas.
// Cómo: define las operaciones de consulta, lookups jerárquicos, CRUD y cambio de estado del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_COMPETENCIAS_TECNICASService
    {
        // Qué hace: define la consulta del listado de competencias técnicas.
        // Cómo: recibe SC_COMPETENCIAS_TECNICASParam con los filtros y devuelve CResult con el catálogo.
        Task<CResult> GetAllAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        // Qué hace: define la consulta de una competencia técnica específica.
        // Cómo: recibe SC_COMPETENCIAS_TECNICASParam con CORR_COMPETENCIAS_TECNICAS y devuelve CResult con el registro.
        Task<CResult> GetAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        // Qué hace: define la consulta de posibles padres para la jerarquía.
        // Cómo: recibe SC_COMPETENCIAS_TECNICASParam con NIVEL_PADRE y devuelve CResult con las opciones de lookup.
        Task<CResult> GetPadresAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        // Qué hace: define el catálogo de nivel tres para el descriptor de puesto.
        // Cómo: recibe SC_COMPETENCIAS_TECNICASParam con CORR_EMPRESA y devuelve CResult con competencias agrupadas.
        Task<CResult> GetCatalogoNivel3DescriptorAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        // Qué hace: define el cálculo del siguiente código según el padre de nivel 2.
        // Cómo: recibe SC_COMPETENCIAS_TECNICASParam con CORR_COMPETENCIAS_TECNICAS_PADRE y devuelve CResult con CODIGO_COMPETENCIAS_TECNICAS.
        Task<CResult> GetNextCodigoAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        // Qué hace: define la creación validada de una competencia técnica.
        // Cómo: recibe SC_COMPETENCIAS_TECNICASTable con auditoría y devuelve CResult con el registro creado.
        Task<CResult> CreateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: define la actualización validada de una competencia técnica.
        // Cómo: recibe SC_COMPETENCIAS_TECNICASTable con auditoría y devuelve CResult con el registro actualizado.
        Task<CResult> UpdateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: define la eliminación de una competencia técnica.
        // Cómo: recibe SC_COMPETENCIAS_TECNICASTable con las claves y devuelve CResult con el resultado de la operación.
        Task<CResult> DeleteAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: define el cambio de estado activo/inactivo de la competencia técnica.
        // Cómo: recibe SC_COMPETENCIAS_TECNICASTable con las claves y devuelve CResult con el registro actualizado.
        Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
