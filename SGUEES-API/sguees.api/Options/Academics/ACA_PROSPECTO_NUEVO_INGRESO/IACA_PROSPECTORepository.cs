using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_PROSPECTORepository : IRepository<ACA_PROSPECTOTable>
    {
        // Qué hacen: la oferta que puede elegir el prospecto al cambiar de carrera.
        Task<CResult> GetCarrerasDelCicloAsync(List<CParameter> xWhere);
        Task<CResult> GetModalidadesDeCarreraAsync(List<CParameter> xWhere);
        Task<CResult> GetCiclosAsync(List<CParameter> xWhere);
        Task<CResult> ValidarCambioAsync(List<CParameter> xWhere);
        Task<CResult> GetPuedeAprobarAsync(List<CParameter> xWhere);
        Task<CResult> AprobarAsync(int corrEmpresa, int corrProspecto, string login, string observacion, string estacion);
    }
}
