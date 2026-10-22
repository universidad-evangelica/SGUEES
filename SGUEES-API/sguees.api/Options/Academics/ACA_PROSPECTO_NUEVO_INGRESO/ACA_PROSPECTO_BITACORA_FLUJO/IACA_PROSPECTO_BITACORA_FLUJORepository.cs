using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;

namespace sguees.Repositories
{
    public interface IACA_PROSPECTO_BITACORA_FLUJORepository
    {
        Task<CResult> GetAllAsync(List<CParameter> xWhere);
    }
}
