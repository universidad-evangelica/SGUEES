// Qué hace: contrato del servicio de unidades por usuario.
// Cómo: declara consultas, creación, eliminación y asignación masiva.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_UNIDADES_USUARIOService
    {
        Task<CResult> GetAllAsync(SC_UNIDADES_USUARIOParam xWhere);
        // Qué hace: lookup de unidades efectivas (puesto + configuradas) vía SP.
        // Cómo: el controlador GetCORR_UNIDAD_* llama este método en lugar de GetAll.
        Task<CResult> GetUnidadesUsuarioAsync(SC_UNIDADES_USUARIOParam xWhere);
        Task<CResult> GetAsync(SC_UNIDADES_USUARIOParam xWhere);
        Task<CResult> CreateAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION);
        Task<CResult> AsignarTodasUnidadesAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION);
        Task<CResult> QuitarTodasUnidadesAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION);
    }
}
