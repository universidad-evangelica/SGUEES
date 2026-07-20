using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Contrato del servicio de SC_PERFIL_PUESTO_EXPERIENCIA: reglas de negocio para los requisitos de
    // experiencia del perfil de puesto.
    public interface ISC_PERFIL_PUESTO_EXPERIENCIAService
    {
        // Obtiene el listado de experiencia del perfil aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_PERFIL_PUESTO_EXPERIENCIAParam xWhere);
        // Obtiene un registro de experiencia del perfil con los identificadores recibidos.
        Task<CResult> GetAsync(SC_PERFIL_PUESTO_EXPERIENCIAParam xWhere);
        // Valida y crea el registro de experiencia del perfil con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_PERFIL_PUESTO_EXPERIENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de experiencia del perfil.
        Task<CResult> UpdateAsync(SC_PERFIL_PUESTO_EXPERIENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de experiencia del perfil.
        Task<CResult> DeleteAsync(SC_PERFIL_PUESTO_EXPERIENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
