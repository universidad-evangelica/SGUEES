using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface IPLA_TIPO_PUESTOService
    {
        Task<CResult> GetAllAsync(PLA_TIPO_PUESTOParam xWhere);
        Task<CResult> GetAsync(PLA_TIPO_PUESTOParam xWhere);
        Task<CResult> CreateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DesactivarAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
