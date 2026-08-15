using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Contrato del servicio de SC_PERFIL_PUESTO: reglas de negocio para el perfil (requisitos generales)
    // del descriptor de puesto.
    public interface ISC_PERFIL_PUESTOService
    {
        // Obtiene el listado de perfil del puesto aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_PERFIL_PUESTOParam xWhere);
        // Obtiene un registro de perfil del puesto con los identificadores recibidos.
        Task<CResult> GetAsync(SC_PERFIL_PUESTOParam xWhere);
        // Valida y crea el registro de perfil del puesto con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_PERFIL_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de perfil del puesto.
        Task<CResult> UpdateAsync(SC_PERFIL_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
