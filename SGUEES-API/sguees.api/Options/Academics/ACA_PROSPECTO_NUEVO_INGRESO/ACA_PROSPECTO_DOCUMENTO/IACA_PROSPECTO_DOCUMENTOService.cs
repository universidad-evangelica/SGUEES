using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_DOCUMENTOService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_DOCUMENTOParam xWhere);
    }
}
