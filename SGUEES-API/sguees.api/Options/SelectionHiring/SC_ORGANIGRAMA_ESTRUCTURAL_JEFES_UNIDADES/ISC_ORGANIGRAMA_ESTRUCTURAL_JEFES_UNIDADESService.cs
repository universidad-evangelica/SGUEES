using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface ISC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESService
    {
        Task<CResult> GetByUnidadAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam xWhere);
        Task<CResult> GetEmpleadosByUnidadAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam xWhere);
        Task<CResult> GetAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam xWhere);
        Task<CResult> CreateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}