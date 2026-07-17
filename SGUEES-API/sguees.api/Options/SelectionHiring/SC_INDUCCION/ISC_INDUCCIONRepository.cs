using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_INDUCCIONRepository : IRepository<SC_INDUCCIONTable>
    {
        Task<List<SC_INDUCCIONView>> GetCatalogoDescriptorAsync(int corrEmpresa);
        Task<CResult> ActivarInactivarAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
