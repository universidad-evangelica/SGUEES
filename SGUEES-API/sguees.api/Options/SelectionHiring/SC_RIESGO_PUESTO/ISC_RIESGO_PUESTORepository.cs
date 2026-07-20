// Contrato del repositorio de riesgo del puesto.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_RIESGO_PUESTORepository : IRepository<SC_RIESGO_PUESTOTable>
    {
        // Define la búsqueda de riesgos del puesto activos para el lookup del descriptor de puesto.
        Task<List<SC_RIESGO_PUESTOView>> GetCatalogoDescriptorAsync(int corrEmpresa);
        // Define la verificación de nombre duplicado en la empresa.
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
        // Define el cambio de estado activo/inactivo del riesgo del puesto.
        Task<CResult> ActivarInactivarAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
