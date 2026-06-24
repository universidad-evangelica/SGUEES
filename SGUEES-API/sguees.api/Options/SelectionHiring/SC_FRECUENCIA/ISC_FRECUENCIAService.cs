using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_FRECUENCIAService
    {
        Task<CResult> GetAllAsync(SC_FRECUENCIAParam xWhere);
        Task<CResult> GetAsync(SC_FRECUENCIAParam xWhere);
        Task<CResult> CreateAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DesactivarAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
