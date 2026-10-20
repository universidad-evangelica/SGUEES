using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;

namespace sguees.Repositories
{
    public interface IACA_PROSPECTO_BITACORARepository
    {
        Task<CResult> GetAllAsync(int corrProspecto);
        Task<CResult> InsertAsync(int corrProspecto, string comentario, string login, string estacion);
    }
}
