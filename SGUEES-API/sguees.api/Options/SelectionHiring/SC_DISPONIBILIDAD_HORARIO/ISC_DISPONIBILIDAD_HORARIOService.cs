using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_DISPONIBILIDAD_HORARIOService
    {
        Task<CResult> GetAllAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere);
        Task<CResult> GetAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere);
        Task<CResult> CreateAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DesactivarAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
