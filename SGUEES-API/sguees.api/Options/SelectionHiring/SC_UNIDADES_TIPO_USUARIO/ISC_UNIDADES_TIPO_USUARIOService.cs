// Qué hace: contrato del servicio de unidades por tipo de usuario.
// Cómo: declara GetAll, Get, Create, Delete y ActivarInactivar sobre SC_UNIDADES_TIPO_USUARIO.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_UNIDADES_TIPO_USUARIOService
    {
        Task<CResult> GetAllAsync(SC_UNIDADES_TIPO_USUARIOParam xWhere);
        Task<CResult> GetAsync(SC_UNIDADES_TIPO_USUARIOParam xWhere);
        Task<CResult> CreateAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> ActivarInactivarAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
