using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface ISEG_FLUJO_ACTOR_ASIGNACIONService
    {
        Task<CResult> GetAllAsync(SEG_FLUJO_ACTOR_ASIGNACIONParam xWhere);
        Task<CResult> GetAsync(SEG_FLUJO_ACTOR_ASIGNACIONParam xWhere);
        Task<CResult> CreateAsync(SEG_FLUJO_ACTOR_ASIGNACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SEG_FLUJO_ACTOR_ASIGNACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SEG_FLUJO_ACTOR_ASIGNACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}