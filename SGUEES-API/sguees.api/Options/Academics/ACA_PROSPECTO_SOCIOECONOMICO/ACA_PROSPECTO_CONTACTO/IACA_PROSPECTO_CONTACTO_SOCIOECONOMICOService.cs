using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_CONTACTO_SOCIOECONOMICOService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_CONTACTO_SOCIOECONOMICOParam xWhere);
        Task<CResult> GetAsync(ACA_PROSPECTO_CONTACTO_SOCIOECONOMICOParam xWhere);
        Task<CResult> GetCODIGO_PAIS_ACA_PROSPECTOAsync();
        Task<CResult> CreateAsync(ACA_PROSPECTO_CONTACTO_SOCIOECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_PROSPECTO_CONTACTO_SOCIOECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_PROSPECTO_CONTACTO_SOCIOECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
