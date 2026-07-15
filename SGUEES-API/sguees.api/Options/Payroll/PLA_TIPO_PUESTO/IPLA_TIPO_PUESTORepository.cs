using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IPLA_TIPO_PUESTORepository : IRepository<PLA_TIPO_PUESTOTable>
    {
        Task<CResult> ActivarInactivarAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
        Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
    }
}
