using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
namespace sguees.Repositories
{
    public interface ISEG_FLUJO_ACTORRepository : IRepository<SEG_FLUJO_ACTORTable>
    {
         //  Agregar método para obtener empleados disponibles
        Task<CResult> GetEmpleadosDisponiblesAsync(List<CParameter> xWhere);
    }
}