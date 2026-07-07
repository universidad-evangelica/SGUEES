using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_IMPACTO_ECONOMICORepository : IRepository<SC_IMPACTO_ECONOMICOTable>
    {
        Task<CResult> ActivarInactivarAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
