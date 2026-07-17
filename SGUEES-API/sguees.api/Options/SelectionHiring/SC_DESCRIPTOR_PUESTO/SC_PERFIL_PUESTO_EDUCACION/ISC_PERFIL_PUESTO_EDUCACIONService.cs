using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_PERFIL_PUESTO_EDUCACIONService
    {
        // Obtiene el listado de educación del perfil aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_PERFIL_PUESTO_EDUCACIONParam xWhere);
        // Obtiene un registro de educación del perfil con los identificadores recibidos.
        Task<CResult> GetAsync(SC_PERFIL_PUESTO_EDUCACIONParam xWhere);
        // Valida y crea el registro de educación del perfil con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_PERFIL_PUESTO_EDUCACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de educación del perfil.
        Task<CResult> UpdateAsync(SC_PERFIL_PUESTO_EDUCACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de educación del perfil.
        Task<CResult> DeleteAsync(SC_PERFIL_PUESTO_EDUCACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
