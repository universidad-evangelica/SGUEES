using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_DESCRIPTOR_PUESTOService
    {
        Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTOParam xWhere);
        Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTOParam xWhere);
        Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
