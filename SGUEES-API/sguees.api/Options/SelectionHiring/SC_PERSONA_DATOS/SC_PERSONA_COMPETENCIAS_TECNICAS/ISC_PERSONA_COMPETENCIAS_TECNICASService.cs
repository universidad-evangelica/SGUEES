using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
namespace sguees.Services
{
    public interface ISC_PERSONA_COMPETENCIAS_TECNICASService
    {
        Task<CResult> GetAllAsync(SC_PERSONA_COMPETENCIAS_TECNICASParam xWhere);
        Task<CResult> GetAsync(SC_PERSONA_COMPETENCIAS_TECNICASParam xWhere);
        Task<CResult> CreateAsync(SC_PERSONA_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_PERSONA_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_PERSONA_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
