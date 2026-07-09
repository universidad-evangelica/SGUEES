using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_DESCRIPTOR_FUNCION_ACTIVIDADRepository
    {
        Task<CResult> GetAllAsync(List<CParameter> xWhere);
        Task<CResult> GetAsync(List<CParameter> xWhere);
        Task<CResult> CreateAsync(SC_DESCRIPTOR_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteByFuncionAsync(SC_DESCRIPTOR_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
