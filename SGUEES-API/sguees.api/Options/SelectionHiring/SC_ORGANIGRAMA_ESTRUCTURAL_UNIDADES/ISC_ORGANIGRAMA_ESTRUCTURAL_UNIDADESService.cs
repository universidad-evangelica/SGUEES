using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESService
    {
        Task<CResult> GetAllAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam xWhere);
        Task<CResult> GetAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam xWhere);
        Task<CResult> CreateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}