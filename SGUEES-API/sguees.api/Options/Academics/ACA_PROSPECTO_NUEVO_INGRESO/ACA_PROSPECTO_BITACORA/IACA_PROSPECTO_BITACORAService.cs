using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_BITACORAService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_BITACORAParam xWhere);
    }
}
