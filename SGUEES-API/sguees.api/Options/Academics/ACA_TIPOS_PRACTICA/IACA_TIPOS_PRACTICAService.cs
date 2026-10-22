using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_TIPOS_PRACTICAService
    {
        Task<CResult> GetAllAsync(ACA_TIPOS_PRACTICAParam data);
        Task<CResult> GuardarAsync(ACA_TIPOS_PRACTICATable data, bool update, string user, string station);
    }
}
