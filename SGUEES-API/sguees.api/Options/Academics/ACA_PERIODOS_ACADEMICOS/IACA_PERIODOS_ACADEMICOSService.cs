using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PERIODOS_ACADEMICOSService
    {
        Task<CResult> GetAllAsync(ACA_PERIODOS_ACADEMICOSParam xWhere);
        Task<CResult> GetAsync(ACA_PERIODOS_ACADEMICOSParam xWhere);
        Task<CResult> CreateAsync(ACA_PERIODOS_ACADEMICOSTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_PERIODOS_ACADEMICOSTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_PERIODOS_ACADEMICOSTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetCICLO_ACA_PROSPECTOAsync(ACA_PERIODOS_ACADEMICOSParam xWhere);
    }
}
