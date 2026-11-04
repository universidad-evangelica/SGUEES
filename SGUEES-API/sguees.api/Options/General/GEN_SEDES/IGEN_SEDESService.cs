using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IGEN_SEDESService
    {
        Task<CResult> GetCORR_SEDE_ACA_FACULTADES_SEDESAsync(GEN_SEDESParam xWhere);
    }
}
