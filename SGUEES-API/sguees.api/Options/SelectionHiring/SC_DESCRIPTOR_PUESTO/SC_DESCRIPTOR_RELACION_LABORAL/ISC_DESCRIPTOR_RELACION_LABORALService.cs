using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_DESCRIPTOR_RELACION_LABORALService
    {
        // Obtiene el listado de relación laboral aplicando los filtros recibidos.
        Task<CResult> GetAllAsync(SC_DESCRIPTOR_RELACION_LABORALParam xWhere);
        // Obtiene un registro de relación laboral con los identificadores recibidos.
        Task<CResult> GetAsync(SC_DESCRIPTOR_RELACION_LABORALParam xWhere);
        // Valida y crea el registro de relación laboral con sus datos de auditoría.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida y actualiza el registro existente de relación laboral.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Valida las claves y elimina el registro de relación laboral.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
