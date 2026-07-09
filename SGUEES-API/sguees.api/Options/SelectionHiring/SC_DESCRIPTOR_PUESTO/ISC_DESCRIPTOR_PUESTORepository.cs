using System.Threading.Tasks;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_DESCRIPTOR_PUESTORepository : IRepository<SC_DESCRIPTOR_PUESTOTable>
    {
        Task<bool> ExistsDescriptorAbiertoPorPuestoAsync(int corrEmpresa, int corrPuesto, int excludeCorrDescriptor);
    }
}
