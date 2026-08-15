using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    // Contrato del repositorio de SC_DESCRIPTOR_PUESTO: CRUD base (heredado de IRepository) más las
    // operaciones específicas del encabezado del descriptor de puesto.
    public interface ISC_DESCRIPTOR_PUESTORepository : IRepository<SC_DESCRIPTOR_PUESTOTable>
    {
        // Comprueba si el puesto ya tiene otro descriptor abierto en la empresa.
        Task<bool> ExistsDescriptorAbiertoPorPuestoAsync(int corrEmpresa, int corrPuesto, int excludeCorrDescriptor);
        // Actualiza solo RESPONSABLE (Entrenamiento).
        Task<CResult> UpdateResponsableAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Actualiza solo impacto económico.
        Task<CResult> UpdateImpactoEconomicoAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
