using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
namespace sguees.Services
{
    public interface ISC_PERSONA_IDIOMASService
    {
        Task<CResult> GetAllAsync(SC_PERSONA_IDIOMASParam xWhere);
        Task<CResult> GetAsync(SC_PERSONA_IDIOMASParam xWhere);
        Task<CResult> CreateAsync(SC_PERSONA_IDIOMASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_PERSONA_IDIOMASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_PERSONA_IDIOMASTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
