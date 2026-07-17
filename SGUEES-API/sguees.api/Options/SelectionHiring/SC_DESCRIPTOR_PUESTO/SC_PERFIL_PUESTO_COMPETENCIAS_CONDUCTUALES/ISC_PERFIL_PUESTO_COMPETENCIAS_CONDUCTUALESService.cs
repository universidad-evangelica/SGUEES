using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESService
    {
        // Obtiene el listado de competencia conductual del perfil aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESParam xWhere);
        // Obtiene un registro de competencia conductual del perfil con los identificadores recibidos.
        Task<CResult> GetAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESParam xWhere);
        // Valida y crea el registro de competencia conductual del perfil con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de competencia conductual del perfil.
        Task<CResult> UpdateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de competencia conductual del perfil.
        Task<CResult> DeleteAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
