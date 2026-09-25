using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IGEN_SECTOR_LABORALService
    {
        Task<CResult> GetAllAsync(GEN_SECTOR_LABORALParam xWhere);
        Task<CResult> GetAsync(GEN_SECTOR_LABORALParam xWhere);
        Task<CResult> CreateAsync(GEN_SECTOR_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(GEN_SECTOR_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(GEN_SECTOR_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetCORR_SECTOR_LABORAL_ACA_PROSPECTOAsync(GEN_SECTOR_LABORALParam xWhere);
    }
}
