using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    // Contrato de acceso a datos de PLA_NIVEL_ACADEMICO.
    public interface IPLA_NIVEL_ACADEMICORepository : IRepository<PLA_NIVEL_ACADEMICOTable>
    {
        // Ejecuta el procedimiento común de cambio de estado.
        Task<CResult> ActivarInactivarAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Indica si el nombre ya existe en la empresa.
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
    }
}
