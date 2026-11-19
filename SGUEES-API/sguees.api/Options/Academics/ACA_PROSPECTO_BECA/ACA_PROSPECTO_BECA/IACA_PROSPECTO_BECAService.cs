using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_BECAService
    {
        Task<CResult> GetFlujoAsync(int empresa, int solicitud, string usuario);
        Task<CResult> GetBitacoraFlujoAsync(int empresa, int solicitud);
        Task<CResult> GetBitacoraEdicionAsync(int empresa, int solicitud);
        Task<CResult> AccionFlujoAsync(int empresa, BecaSolicitudResolucion data, string operacion, string usuario, string estacion);
        Task<CResult> GetAllAsync(ACA_PROSPECTO_BECAParam xWhere);
        Task<CResult> GetAsync(ACA_PROSPECTO_BECAParam xWhere);
        Task<CResult> CreateAsync(ACA_PROSPECTO_BECATable data, string login, string estacion);
        Task<CResult> UpdateAsync(ACA_PROSPECTO_BECATable data, string login, string estacion);
        Task<CResult> DeleteAsync(ACA_PROSPECTO_BECATable data, string login, string estacion);
    }
}
