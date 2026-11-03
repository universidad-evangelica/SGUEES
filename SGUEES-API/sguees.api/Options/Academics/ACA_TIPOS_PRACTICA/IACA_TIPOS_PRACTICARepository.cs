using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_TIPOS_PRACTICARepository
    {
        Task<CResult> GetAllAsync(ACA_TIPOS_PRACTICAParam data);
        Task<CResult> GuardarAsync(ACA_TIPOS_PRACTICATable data, string user, string station);
    }
}
