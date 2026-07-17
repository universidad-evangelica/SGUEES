using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALService
    {
        // Obtiene el listado de requerimiento organizacional aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALParam xWhere);
        // Obtiene un registro de requerimiento organizacional con los identificadores recibidos.
        Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALParam xWhere);
        // Valida y crea el registro de requerimiento organizacional con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de requerimiento organizacional.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de requerimiento organizacional.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Agrega al descriptor los registros activos de requerimiento organizacional que aún no existen.
        Task<CResult> SeedActivosDesdeCatalogoAsync(int corrEmpresa, int corrDescriptor, string usuario, string estacion);
    }
}
