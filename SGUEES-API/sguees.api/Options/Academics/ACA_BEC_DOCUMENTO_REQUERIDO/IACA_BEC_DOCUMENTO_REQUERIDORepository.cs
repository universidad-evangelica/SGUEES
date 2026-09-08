using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IACA_BEC_DOCUMENTO_REQUERIDORepository : IRepository<ACA_BEC_DOCUMENTO_REQUERIDOTable>
    {
        Task<CResult> ActivarInactivarAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetTiposBecaAsync(int corrEmpresa);
    }
}

