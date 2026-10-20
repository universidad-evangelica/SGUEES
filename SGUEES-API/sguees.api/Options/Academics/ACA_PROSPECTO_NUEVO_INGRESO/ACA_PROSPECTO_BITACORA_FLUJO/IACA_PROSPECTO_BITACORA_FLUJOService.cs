using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_BITACORA_FLUJOService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_BITACORA_FLUJOParam xWhere);
    }
}
