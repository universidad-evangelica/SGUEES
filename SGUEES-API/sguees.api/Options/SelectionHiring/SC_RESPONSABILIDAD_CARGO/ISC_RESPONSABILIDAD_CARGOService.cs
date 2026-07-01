using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_RESPONSABILIDAD_CARGOService
    {
        Task<CResult> GetAllAsync(SC_RESPONSABILIDAD_CARGOParam xWhere);
        Task<CResult> GetDistinctValuesAsync(SC_RESPONSABILIDAD_CARGOParam xWhere);
        Task<CResult> GetAsync(SC_RESPONSABILIDAD_CARGOParam xWhere);
        Task<CResult> CreateAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DesactivarAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
