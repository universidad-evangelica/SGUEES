using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_PERFIL_PUESTOService
    {
        Task<CResult> GetAllAsync(SC_PERFIL_PUESTOParam xWhere);
        Task<CResult> GetAsync(SC_PERFIL_PUESTOParam xWhere);
        Task<CResult> CreateAsync(SC_PERFIL_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_PERFIL_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
