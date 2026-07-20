using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Contrato del servicio de SC_DESCRIPTOR_FUNCION: reglas de negocio para las funciones del descriptor de puesto.
    public interface ISC_DESCRIPTOR_FUNCIONService
    {
        // Obtiene el listado de función del descriptor aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_DESCRIPTOR_FUNCIONParam xWhere);
        // Obtiene un registro de función del descriptor con los identificadores recibidos.
        Task<CResult> GetAsync(SC_DESCRIPTOR_FUNCIONParam xWhere);
        // Valida y crea el registro de función del descriptor con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de función del descriptor.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de función del descriptor.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
