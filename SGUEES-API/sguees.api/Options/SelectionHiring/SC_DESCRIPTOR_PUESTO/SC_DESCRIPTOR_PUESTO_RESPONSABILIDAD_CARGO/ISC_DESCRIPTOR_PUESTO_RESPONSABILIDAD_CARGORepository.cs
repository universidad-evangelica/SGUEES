using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGORepository : IRepository<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable>
    {
        Task<List<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOView>> GetAllSinFiltroFormatoAsync(
            int corrEmpresa,
            int corrDescriptor);
        Task<string> GetFormatoDescriptorAsync(int corrEmpresa, int corrDescriptor);
    }
}
