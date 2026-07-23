using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Contrato del servicio de SC_PERFIL_PUESTO_COMPETENCIAS_TECNICAS: reglas de negocio para las
    // competencias técnicas del perfil de puesto.
    public interface ISC_PERFIL_PUESTO_COMPETENCIAS_TECNICASService
    {
        // Obtiene el listado de competencia técnica del perfil aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASParam xWhere);
        // Obtiene un registro de competencia técnica del perfil con los identificadores recibidos.
        Task<CResult> GetAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASParam xWhere);
        // Valida y crea el registro de competencia técnica del perfil con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de competencia técnica del perfil.
        Task<CResult> UpdateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de competencia técnica del perfil.
        Task<CResult> DeleteAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
