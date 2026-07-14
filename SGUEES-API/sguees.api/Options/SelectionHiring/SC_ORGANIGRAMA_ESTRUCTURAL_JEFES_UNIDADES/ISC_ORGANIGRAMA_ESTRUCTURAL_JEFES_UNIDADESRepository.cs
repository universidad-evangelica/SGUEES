using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface ISC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESRepository : IRepository<SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESTable>
    {
        //  Agregar método para obtener empleados disponibles
        Task<CResult> GetEmpleadosDisponiblesAsync(List<CParameter> xWhere);
    }
}