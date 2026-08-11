// Qué hace: contrato del repositorio de puestos por unidad.
// Cómo: extiende IRepository y agrega ExistsAsync para la PK compuesta.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IGEN_UNIDADES_PUESTORepository : IRepository<GEN_UNIDADES_PUESTOTable>
    {
        Task<bool> ExistsAsync(int corrEmpresa, int corrUnidad, int corrPuesto);
        Task<CResult> AsignarTodosPuestosAsync(GEN_UNIDADES_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
