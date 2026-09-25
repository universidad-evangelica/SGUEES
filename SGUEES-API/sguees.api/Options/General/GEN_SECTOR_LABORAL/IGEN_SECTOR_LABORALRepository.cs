using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IGEN_SECTOR_LABORALRepository : IRepository<GEN_SECTOR_LABORALTable>
    {
        Task<CResult> GetCORR_SECTOR_LABORAL_ACA_PROSPECTOAsync(List<CParameter> xWhere);
    }
}
