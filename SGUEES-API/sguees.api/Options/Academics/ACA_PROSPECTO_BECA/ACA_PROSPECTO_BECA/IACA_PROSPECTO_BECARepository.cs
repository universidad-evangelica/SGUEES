using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_PROSPECTO_BECARepository : IRepository<ACA_PROSPECTO_BECATable>
    {
        Task<CResult> GetFlujoAsync(List<CParameter> parametros);
        Task<CResult> GetBitacoraFlujoAsync(List<CParameter> parametros);
        Task<CResult> GetBitacoraEdicionAsync(List<CParameter> parametros);
        Task<CResult> AccionFlujoAsync(int empresa, BecaSolicitudResolucion data, string operacion, string usuario, string estacion);
    }
}
