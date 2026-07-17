using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_DESCRIPTOR_PUESTORepository : IRepository<SC_DESCRIPTOR_PUESTOTable>
    {
        Task<bool> ExistsDescriptorAbiertoPorPuestoAsync(int corrEmpresa, int corrPuesto, int excludeCorrDescriptor);
        Task<SC_INDUCCIONView> GetInduccionActivaAsync(int corrEmpresa, int corrInduccion);
        Task<CResult> ActualizarEntrenamientoAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
