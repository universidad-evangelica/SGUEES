// Contrato del repositorio de inducción.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_INDUCCIONRepository : IRepository<SC_INDUCCIONTable>
    {
        Task<List<SC_INDUCCIONView>> GetCatalogoDescriptorAsync(int corrEmpresa);
        // Define el cambio de estado activo/inactivo de la inducción.
        Task<CResult> ActivarInactivarAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
