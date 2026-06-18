using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_INDUCCIONService
    {
        Task<CResult> GetAllAsync(SC_INDUCCIONParam xWhere);
        Task<CResult> GetAsync(SC_INDUCCIONParam xWhere);
        Task<CResult> CreateAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DesactivarAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
