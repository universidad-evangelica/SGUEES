using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface ISEG_FLUJO_ESTADO_MENSAJEService
    {
        Task<CResult> GetAllAsync(SEG_FLUJO_ESTADO_MENSAJEParam xWhere);
        Task<CResult> GetAsync(SEG_FLUJO_ESTADO_MENSAJEParam xWhere);
        Task<CResult> CreateAsync(SEG_FLUJO_ESTADO_MENSAJETable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SEG_FLUJO_ESTADO_MENSAJETable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SEG_FLUJO_ESTADO_MENSAJETable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}