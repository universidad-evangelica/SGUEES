// Qué hace: contrato del repositorio de unidades por tipo de usuario.
// Cómo: extiende IRepository y agrega ExistsAsync y ActivarInactivarAsync para la PK compuesta.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_UNIDADES_TIPO_USUARIORepository : IRepository<SC_UNIDADES_TIPO_USUARIOTable>
    {
        Task<bool> ExistsAsync(int corrEmpresa, int corrUnidad, int tipoUsuario);
        Task<CResult> ActivarInactivarAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
