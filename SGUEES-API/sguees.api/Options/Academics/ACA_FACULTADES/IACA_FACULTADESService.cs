using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_FACULTADESService
    {
        Task<CResult> GetCatalogoCarrerasAsync(int empresa);
        Task<CResult> GetAllAsync(ACA_FACULTADESParam xWhere);
        Task<CResult> GetAsync(ACA_FACULTADESParam xWhere);
        Task<CResult> CreateAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> ActivarInactivarAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
