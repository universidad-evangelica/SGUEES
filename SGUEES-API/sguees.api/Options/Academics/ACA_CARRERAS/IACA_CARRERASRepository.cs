using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_CARRERASRepository : IRepository<ACA_CARRERASTable>
    {
        Task<CResult> GetCORR_CARRERA_ACA_PROSPECTOAsync(List<CParameter> xWhere);
    }
}
