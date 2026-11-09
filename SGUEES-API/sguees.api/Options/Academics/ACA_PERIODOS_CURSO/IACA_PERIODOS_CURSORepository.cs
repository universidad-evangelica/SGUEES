using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_PERIODOS_CURSORepository
    {
        Task<CResult> GetAllAsync(ACA_PERIODOS_CURSOParam data);
        Task<CResult> GuardarAsync(ACA_PERIODOS_CURSOTable data, string user, string station);
    }
}
