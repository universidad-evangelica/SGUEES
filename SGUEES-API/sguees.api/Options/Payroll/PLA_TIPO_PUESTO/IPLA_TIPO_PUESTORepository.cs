using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    // Contrato de acceso a datos de PLA_TIPO_PUESTO.
    public interface IPLA_TIPO_PUESTORepository : IRepository<PLA_TIPO_PUESTOTable>
    {
        // Ejecuta el procedimiento común de cambio de estado.
        Task<CResult> ActivarInactivarAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Indica si el nombre ya existe en la empresa.
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
        // Indica si el código ya existe en la empresa.
        Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
    }
}
