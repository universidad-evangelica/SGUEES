using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface ISEG_FLUJO_ACTORService
    {
        Task<CResult> GetAllAsync(SEG_FLUJO_ACTORParam xWhere);
        Task<CResult> GetAsync(SEG_FLUJO_ACTORParam xWhere);
        Task<CResult> CreateAsync(SEG_FLUJO_ACTORTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SEG_FLUJO_ACTORTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SEG_FLUJO_ACTORTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}