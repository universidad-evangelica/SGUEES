// Contrato del servicio de inducción.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_INDUCCIONService
    {
        // Define la consulta del catálogo activo para el descriptor de puesto.
        Task<CResult> GetCatalogoDescriptorAsync(SC_INDUCCIONParam xWhere);
        // Define la consulta del listado de inducciones según los filtros recibidos.
        Task<CResult> GetAllAsync(SC_INDUCCIONParam xWhere);
        // Define la consulta de una inducción específica por sus claves.
        Task<CResult> GetAsync(SC_INDUCCIONParam xWhere);
        // Define la creación validada de una inducción con su información de auditoría.
        Task<CResult> CreateAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la actualización validada de una inducción con su información de auditoría.
        Task<CResult> UpdateAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la eliminación de una inducción identificada por sus claves.
        Task<CResult> DeleteAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define el cambio de estado activo/inactivo de la inducción.
        Task<CResult> ActivarInactivarAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
