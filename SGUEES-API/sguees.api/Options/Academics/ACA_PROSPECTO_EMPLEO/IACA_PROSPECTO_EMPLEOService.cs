using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_EMPLEOService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_EMPLEOParam xWhere);
        Task<CResult> GetAsync(ACA_PROSPECTO_EMPLEOParam xWhere);
        Task<CResult> CreateAsync(ACA_PROSPECTO_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_PROSPECTO_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_PROSPECTO_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
