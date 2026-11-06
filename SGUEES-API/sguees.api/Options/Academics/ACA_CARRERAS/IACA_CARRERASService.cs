using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_CARRERASService
    {
        Task<CResult> GetCatalogoAsync(CatalogoCarrera catalogo, int empresa);
        Task<CResult> GetAllAsync(ACA_CARRERASParam xWhere);
        Task<CResult> GetAsync(ACA_CARRERASParam xWhere);
        Task<CResult> CreateAsync(ACA_CARRERASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_CARRERASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_CARRERASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetCORR_CARRERA_ACA_PROSPECTOAsync(ACA_CARRERASParam xWhere);
        Task<CResult> ActivarInactivarAsync(ACA_CARRERASTable data, string user, string station);
    }
}
