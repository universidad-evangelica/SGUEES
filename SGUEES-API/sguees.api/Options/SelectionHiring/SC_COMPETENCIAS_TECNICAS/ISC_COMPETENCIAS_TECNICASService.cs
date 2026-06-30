using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_COMPETENCIAS_TECNICASService
    {
        Task<CResult> GetAllAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        Task<CResult> GetDistinctValuesAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        Task<CResult> GetAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        Task<CResult> GetPadresAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        Task<CResult> GetNextCodigoAsync(SC_COMPETENCIAS_TECNICASParam xWhere);
        Task<CResult> CreateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DesactivarAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
