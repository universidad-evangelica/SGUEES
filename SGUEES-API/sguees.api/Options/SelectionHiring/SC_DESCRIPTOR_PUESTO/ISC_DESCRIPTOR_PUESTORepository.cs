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
        // Busca la inducción activa asociada a la empresa y al identificador recibido.
        Task<SC_INDUCCIONView> GetInduccionActivaAsync(int corrEmpresa, int corrInduccion);
        // Valida y persiste los datos de entrenamiento asociados al descriptor.
        Task<CResult> ActualizarEntrenamientoAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        /// <summary>Lookup sc-requisicion-personal: descriptores por empresa + CORR_UNIDAD.</summary>
        Task<CResult> GetCORR_DESCRIPTOR_PUESTO_SC_REQUISICION_PERSONAL(List<CParameter> xWhere);
    }
}
