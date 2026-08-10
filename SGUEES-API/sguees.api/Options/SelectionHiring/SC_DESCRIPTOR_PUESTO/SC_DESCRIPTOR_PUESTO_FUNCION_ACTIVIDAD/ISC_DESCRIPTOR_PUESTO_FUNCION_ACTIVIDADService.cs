using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Contrato del servicio de SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDAD: reglas de negocio para las actividades
    // de una función del descriptor de puesto.
    public interface ISC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADService
    {
        // Obtiene el listado de actividad de la función aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADParam xWhere);
        // Obtiene un registro de actividad de la función con los identificadores recibidos.
        Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADParam xWhere);
        // Valida y crea el registro de actividad de la función con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de actividad de la función.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de actividad de la función.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
