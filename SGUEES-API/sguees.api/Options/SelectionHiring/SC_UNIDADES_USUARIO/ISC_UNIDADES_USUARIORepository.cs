// Qué hace: contrato del repositorio de unidades por usuario.
// Cómo: extiende IRepository y agrega validación de duplicado y operaciones masivas.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_UNIDADES_USUARIORepository : IRepository<SC_UNIDADES_USUARIOTable>
    {
        Task<bool> ExistsAsync(int corrEmpresa, int corrUnidad, string loginSistema);
        Task<CResult> AsignarTodasUnidadesAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION);
        Task<CResult> QuitarTodasUnidadesAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION);
    }
}
