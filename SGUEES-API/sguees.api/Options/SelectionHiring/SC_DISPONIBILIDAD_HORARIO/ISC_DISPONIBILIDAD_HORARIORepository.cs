using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_DISPONIBILIDAD_HORARIORepository : IRepository<SC_DISPONIBILIDAD_HORARIOTable>
    {
        Task<CResult> ActivarInactivarAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetDisponibilidadesActivasAsync(List<CParameter> xWhere);
    }
}
