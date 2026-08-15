using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Contrato del servicio de SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO: reglas de negocio para las
    // responsabilidades del cargo, incluida la precarga desde el catálogo.
    public interface ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOService
    {
        // Obtiene el listado de responsabilidad del cargo aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOParam xWhere);
        // Obtiene un registro de responsabilidad del cargo con los identificadores recibidos.
        Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOParam xWhere);
        // Valida y crea el registro de responsabilidad del cargo con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de responsabilidad del cargo.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de responsabilidad del cargo.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Agrega al descriptor los registros activos de responsabilidad del cargo que aún no existen.
        Task<CResult> SeedActivosDesdeCatalogoAsync(int corrEmpresa, int corrDescriptor, string usuario, string estacion);
    }
}
