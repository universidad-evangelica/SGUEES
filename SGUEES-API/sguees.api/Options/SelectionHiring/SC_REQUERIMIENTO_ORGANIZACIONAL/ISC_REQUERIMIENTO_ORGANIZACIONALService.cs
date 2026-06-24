using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_REQUERIMIENTO_ORGANIZACIONALService
    {
        Task<CResult> GetAllAsync(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere);
        Task<CResult> GetAsync(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere);
        Task<CResult> CreateAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DesactivarAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
