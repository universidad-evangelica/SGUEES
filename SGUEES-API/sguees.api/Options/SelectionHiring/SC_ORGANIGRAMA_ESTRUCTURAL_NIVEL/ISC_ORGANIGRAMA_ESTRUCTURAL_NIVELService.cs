using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface ISC_ORGANIGRAMA_ESTRUCTURAL_NIVELService
    {
        Task<CResult> GetAllAsync(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELParam xWhere);
        Task<CResult> GetAsync(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELParam xWhere);
        Task<CResult> CreateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}