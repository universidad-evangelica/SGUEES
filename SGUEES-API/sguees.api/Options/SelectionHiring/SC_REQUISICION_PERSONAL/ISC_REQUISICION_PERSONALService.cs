using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;


namespace SGUEES.Services
{
    public interface ISC_REQUISICION_PERSONALService
    {
        Task<CResult> GetAllAsync(SC_REQUISICION_PERSONALParam xWhere);
        /// <summary>Modal sc-solicitud-empleo; filtros de estado opcionales (comentados en implementación).</summary>
        Task<CResult> GetAllForSolicitudEmpleoAsync(SC_REQUISICION_PERSONALParam xWhere);
        Task<CResult> GetAsync(SC_REQUISICION_PERSONALParam xWhere);
        Task<CResult> CreateAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetAllAsyncBitacoraByCORR_REQUISICION(SC_REQUISICION_PERSONAL_BITACORAParam xWhere);
        Task<CResult> GetAllAsyncCandidatosByCORR_REQUISICION(SC_REQUISICION_PERSONAL_CANDIDATOParam xWhere);
    }
}
