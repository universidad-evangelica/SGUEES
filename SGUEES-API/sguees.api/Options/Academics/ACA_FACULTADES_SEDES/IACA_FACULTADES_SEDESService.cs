using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_FACULTADES_SEDESService
    {
        Task<CResult> GetAllAsync(ACA_FACULTADES_SEDESParam xWhere);
        Task<CResult> GetAsync(ACA_FACULTADES_SEDESParam xWhere);
        Task<CResult> CreateAsync(ACA_FACULTADES_SEDESTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_FACULTADES_SEDESTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_FACULTADES_SEDESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
