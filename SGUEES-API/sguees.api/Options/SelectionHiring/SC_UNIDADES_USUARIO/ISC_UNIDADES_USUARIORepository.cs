// Qué hace: contrato del repositorio de unidades por usuario.
// Cómo: extiende IRepository y agrega validación de duplicado y operaciones masivas.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_UNIDADES_USUARIORepository : IRepository<SC_UNIDADES_USUARIOTable>
    {
        Task<bool> ExistsAsync(int corrEmpresa, int corrUnidad, string loginSistema);
        // Qué hace: ejecuta PRAL_DATA_SC_UNIDADES_USUARIO (unidades por puesto + configuradas).
        // Cómo: el lookup GetCORR_UNIDAD_SC_DESCRIPTOR_PUESTO consume este método.
        Task<CResult> GetUnidadesUsuarioAsync(List<CParameter> xWhere);
        Task<CResult> AsignarTodasUnidadesAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION);
        Task<CResult> QuitarTodasUnidadesAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION);
    }
}
