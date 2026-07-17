// Contrato del repositorio de frecuencia.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_FRECUENCIARepository : IRepository<SC_FRECUENCIATable>
    {
        Task<CResult> ActivarInactivarAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetFrecuenciasActivasAsync(List<CParameter> xWhere);
    }
}
