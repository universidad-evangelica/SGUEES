using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_DESCRIPTOR_PUESTO_RIESGO_PUESTOService
    {
        // Obtiene el listado de riesgo del puesto aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOParam xWhere);
        // Obtiene un registro de riesgo del puesto con los identificadores recibidos.
        Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOParam xWhere);
        // Valida y crea el registro de riesgo del puesto con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de riesgo del puesto.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de riesgo del puesto.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Agrega al descriptor los registros activos de riesgo del puesto que aún no existen.
        Task<CResult> SeedActivosDesdeCatalogoAsync(int corrEmpresa, int corrDescriptor, string usuario, string estacion);
    }
}
