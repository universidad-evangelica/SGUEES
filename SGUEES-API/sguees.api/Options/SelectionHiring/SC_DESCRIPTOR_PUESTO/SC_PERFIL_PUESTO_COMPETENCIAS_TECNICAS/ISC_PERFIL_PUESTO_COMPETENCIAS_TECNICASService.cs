using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_PERFIL_PUESTO_COMPETENCIAS_TECNICASService
    {
        Task<CResult> GetAllAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASParam xWhere);
        Task<CResult> GetAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASParam xWhere);
        Task<CResult> CreateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
