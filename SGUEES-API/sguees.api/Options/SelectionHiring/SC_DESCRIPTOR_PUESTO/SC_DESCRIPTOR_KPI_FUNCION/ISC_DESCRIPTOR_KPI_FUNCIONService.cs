using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Contrato del servicio de SC_DESCRIPTOR_KPI_FUNCION: reglas de negocio para los indicadores (KPI)
    // de desempeño del descriptor de puesto.
    public interface ISC_DESCRIPTOR_KPI_FUNCIONService
    {
        // Obtiene el listado de KPI de la función aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_DESCRIPTOR_KPI_FUNCIONParam xWhere);
        // Obtiene un registro de KPI de la función con los identificadores recibidos.
        Task<CResult> GetAsync(SC_DESCRIPTOR_KPI_FUNCIONParam xWhere);
        // Valida y crea el registro de KPI de la función con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_KPI_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de KPI de la función.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_KPI_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de KPI de la función.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_KPI_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
