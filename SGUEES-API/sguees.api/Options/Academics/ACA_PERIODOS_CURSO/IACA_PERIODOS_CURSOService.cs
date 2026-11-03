using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PERIODOS_CURSOService
    {
        Task<CResult> GetAllAsync(ACA_PERIODOS_CURSOParam data);
        Task<CResult> GuardarAsync(ACA_PERIODOS_CURSOTable data, bool update, string user, string station);
    }
}
