using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOService
    {
        Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOParam xWhere);
        Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOParam xWhere);
        Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> SeedActivosDesdeCatalogoAsync(int corrEmpresa, int corrDescriptor, string usuario, string estacion);
    }
}
