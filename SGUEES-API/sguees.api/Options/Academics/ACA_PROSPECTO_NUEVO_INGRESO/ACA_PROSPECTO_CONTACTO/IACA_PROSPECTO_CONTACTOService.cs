using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_CONTACTOService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_CONTACTOParam xWhere);
        Task<CResult> GetAsync(ACA_PROSPECTO_CONTACTOParam xWhere);
        Task<CResult> GetCODIGO_PAIS_ACA_PROSPECTOAsync();
        Task<CResult> CreateAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
