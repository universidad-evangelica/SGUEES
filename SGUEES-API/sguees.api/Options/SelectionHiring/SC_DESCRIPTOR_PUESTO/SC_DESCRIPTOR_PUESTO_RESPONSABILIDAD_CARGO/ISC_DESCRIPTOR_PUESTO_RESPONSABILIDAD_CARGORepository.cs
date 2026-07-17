using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGORepository : IRepository<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable>
    {
        // Obtiene todas las responsabilidades del descriptor sin restringirlas por formato.
        Task<List<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOView>> GetAllSinFiltroFormatoAsync(
            int corrEmpresa,
            int corrDescriptor);
        // Consulta el formato vigente del descriptor indicado.
        Task<string> GetFormatoDescriptorAsync(int corrEmpresa, int corrDescriptor);
    }
}
