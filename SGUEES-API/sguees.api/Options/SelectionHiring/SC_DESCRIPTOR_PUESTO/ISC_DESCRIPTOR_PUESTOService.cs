using System.IO;
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
        // Actualiza solo RESPONSABLE (editable de Entrenamiento).
        Task<CResult> UpdateResponsableAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Actualiza solo impacto económico (fila virtual de Responsabilidades).
        Task<CResult> UpdateImpactoEconomicoAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de descriptor de puesto.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetCORR_DESCRIPTOR_PUESTO_SC_REQUISICION_PERSONAL(SC_DESCRIPTOR_PUESTOParam xWhere);
        Task<CResult> GetCORR_DESCRIPTOR_PUESTO_BY_PUESTO_SC_REQUISICION_PERSONAL(SC_DESCRIPTOR_PUESTOParam xWhere);
        // Mueve el flujo del descriptor (Enviar/Aprobar/Observar/Inactivar/Reactivar).
        Task<CResult> AutorizaAsync(SC_DESCRIPTOR_PUESTO_AUTORIZAParam Data, string vLOGIN_SISTEMA);
        // Qué botones de flujo mostrar según estado, destinatario del paso y permiso U de sesión.
        Task<CResult> GetAccionesFlujoAsync(SC_DESCRIPTOR_PUESTOParam xWhere, string permisoOpcion);
        // Qué hace: genera PDF Formato corto del descriptor (SP + SGUEES-RPT).
        Task<Stream> GetPDFFormatoCortoAsync(SC_DESCRIPTOR_PUESTOParam xWhere, string loginSistema);
        // Qué hace: genera PDF Formato extenso del descriptor (SP + SGUEES-RPT).
        Task<Stream> GetPDFFormatoExtensoAsync(SC_DESCRIPTOR_PUESTOParam xWhere, string loginSistema);
    }
}
