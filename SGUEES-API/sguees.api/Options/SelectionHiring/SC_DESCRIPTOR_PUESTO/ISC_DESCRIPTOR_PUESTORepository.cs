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
        // Comprueba si la unidad+puesto ya tiene otro descriptor abierto en la empresa.
        Task<bool> ExistsDescriptorAbiertoPorPuestoAsync(int corrEmpresa, int corrUnidad, int corrPuesto, int excludeCorrDescriptor);
        // Qué hace: calcula la siguiente VERSION para empresa+unidad+puesto (MAX+1, o 1 si no hay filas).
        // Cómo lo hace: MAX(VERSION) en SC_DESCRIPTOR_PUESTO excluyendo el corr actual (Update).
        Task<int> GetNextVersionPorUnidadPuestoAsync(int corrEmpresa, int corrUnidad, int corrPuesto, int excludeCorrDescriptor);
        /// <summary>Lookup sc-requisicion-personal: descriptores por empresa + CORR_UNIDAD.</summary>
        Task<CResult> GetCORR_DESCRIPTOR_PUESTO_SC_REQUISICION_PERSONAL(List<CParameter> xWhere);
        // Actualiza solo RESPONSABLE (Entrenamiento).
        Task<CResult> UpdateResponsableAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Actualiza solo impacto económico.
        Task<CResult> UpdateImpactoEconomicoAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Ejecuta PRAL_MTTO_SC_DESCRIPTOR_PUESTO_AUTORIZA y relee la vista.
        Task<CResult> AutorizaAsync(SC_DESCRIPTOR_PUESTO_AUTORIZAParam Data, string vLOGIN_SISTEMA);
        // Acciones de flujo visibles para el login (destinatario del paso + estado).
        Task<CResult> GetAccionesFlujoAsync(SC_DESCRIPTOR_PUESTOParam xWhere);
        // Qué hace: lee datos de impresión Formato corto (SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO).
        Task<CResult> GetDescriptorFormatoCortoImprAsync(List<CParameter> xWhere);
    }
}
