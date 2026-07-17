using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_RIESGO_PUESTORepository : IRepository<SC_RIESGO_PUESTOTable>
    {
        // Define el cambio de estado activo/inactivo del riesgo de puesto.
        Task<CResult> ActivarInactivarAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la verificación de unicidad del nombre dentro de la empresa.
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
        Task<List<SC_RIESGO_PUESTOView>> GetCatalogoDescriptorAsync(int corrEmpresa);
    }
}
