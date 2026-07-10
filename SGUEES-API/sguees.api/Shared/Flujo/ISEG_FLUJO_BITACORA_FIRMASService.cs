using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface ISEG_FLUJO_BITACORA_FIRMASService
    {
        Task<CResult> GetFirmasAsync(SEG_FLUJO_BITACORA_FIRMASParam xWhere);
    }
}