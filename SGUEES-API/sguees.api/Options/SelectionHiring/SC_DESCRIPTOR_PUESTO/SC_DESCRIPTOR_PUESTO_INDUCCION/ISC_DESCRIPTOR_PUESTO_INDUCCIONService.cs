using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Contrato del servicio de SC_DESCRIPTOR_PUESTO_INDUCCION: reglas de negocio para las inducciones
    // asociadas al descriptor de puesto, incluida la validación contra el catálogo SC_INDUCCION.
    public interface ISC_DESCRIPTOR_PUESTO_INDUCCIONService
    {
        // Obtiene el listado de inducciones del descriptor aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_INDUCCIONParam xWhere);
        // Obtiene un registro de inducción del descriptor con los identificadores recibidos.
        Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTO_INDUCCIONParam xWhere);
        // Valida y crea el registro de inducción del descriptor con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de inducción del descriptor.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de inducción del descriptor.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
