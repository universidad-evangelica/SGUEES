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
        // Define el cambio de estado activo/inactivo de la frecuencia.
        Task<CResult> ActivarInactivarAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la consulta especializada de frecuencias requerida por el mantenimiento.
        Task<CResult> GetFrecuenciasActivasAsync(List<CParameter> xWhere);
    }
}
