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
    }
}
