using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface ISEG_FLUJO_PASOService
    {
        Task<CResult> GetAllAsync(SEG_FLUJO_PASOParam xWhere);
        Task<CResult> GetAsync(SEG_FLUJO_PASOParam xWhere);
        Task<CResult> CreateAsync(SEG_FLUJO_PASOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SEG_FLUJO_PASOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SEG_FLUJO_PASOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}