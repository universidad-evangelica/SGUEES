using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
namespace sguees.Services
{
    public interface ISC_PERSONA_FAMILIARService
    {
        Task<CResult> GetAllAsync(SC_PERSONA_FAMILIARParam xWhere);
        Task<CResult> GetAsync(SC_PERSONA_FAMILIARParam xWhere);
        Task<CResult> CreateAsync(SC_PERSONA_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_PERSONA_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_PERSONA_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
