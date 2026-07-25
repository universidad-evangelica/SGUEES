using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface ISEG_FLUJO_PASO_ACTOR_DESTINOService
    {
        Task<CResult> GetAllAsync(SEG_FLUJO_PASO_ACTOR_DESTINOParam xWhere);
        Task<CResult> GetAsync(SEG_FLUJO_PASO_ACTOR_DESTINOParam xWhere);
        Task<CResult> CreateAsync(SEG_FLUJO_PASO_ACTOR_DESTINOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SEG_FLUJO_PASO_ACTOR_DESTINOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SEG_FLUJO_PASO_ACTOR_DESTINOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}