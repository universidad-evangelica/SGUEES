using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTOService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTOParam xWhere);
        Task<CResult> GetBorradoresAsync(ACA_PROSPECTOParam xWhere);
        Task<CResult> RegistrarAsync(ACA_PROSPECTOParam data);
        Task<CResult> GetAsync(ACA_PROSPECTOParam xWhere);
        Task<CResult> GetCORR_CARRERA_ACA_PROSPECTOAsync(ACA_PROSPECTOParam xWhere);
        Task<CResult> GetCORR_MODALIDAD_ACA_PROSPECTOAsync(ACA_PROSPECTOParam xWhere);
        Task<CResult> GetCICLO_ACA_PROSPECTOAsync(ACA_PROSPECTOParam xWhere);
        Task<CResult> GetVALIDAR_CAMBIO_ACA_PROSPECTOAsync(ACA_PROSPECTOParam xWhere);
        Task<CResult> GetPuedeAprobarAsync(ACA_PROSPECTOParam xWhere, string login, string permisoOpcion);
        Task<CResult> AccionFlujoAsync(ACA_PROSPECTOParam xWhere, string login, string observacion, string estacion, int operacion);
        Task<CResult> CreateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
