using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface ISEG_FLUJO_ESTADOService
    {
        Task<CResult> GetAllAsync(SEG_FLUJO_ESTADOParam xWhere);
        Task<CResult> GetAsync(SEG_FLUJO_ESTADOParam xWhere);
        Task<CResult> CreateAsync(SEG_FLUJO_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SEG_FLUJO_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SEG_FLUJO_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetByTipoDocumentoAsync(int corrEmpresa, int corrTipoDocumento);
    }
}