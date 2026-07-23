using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Contrato del servicio de SC_DESCRIPTOR_PUESTO: reglas de negocio para consultar, crear, actualizar
    // y eliminar el encabezado del descriptor de puesto.
    public interface ISC_DESCRIPTOR_PUESTOService
    {
        // Obtiene el listado de descriptor de puesto aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTOParam xWhere);
        // Obtiene un registro de descriptor de puesto con los identificadores recibidos.
        Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTOParam xWhere);
        // Valida y crea el registro de descriptor de puesto con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de descriptor de puesto.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y persiste los datos de entrenamiento asociados al descriptor.
        Task<CResult> ActualizarEntrenamientoAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de descriptor de puesto.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
