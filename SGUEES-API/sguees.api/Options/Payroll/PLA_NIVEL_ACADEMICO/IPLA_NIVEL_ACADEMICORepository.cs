using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    // Qué hace: define el contrato de acceso a datos de PLA_NIVEL_ACADEMICO.
    public interface IPLA_NIVEL_ACADEMICORepository : IRepository<PLA_NIVEL_ACADEMICOTable>
    {
        // Qué hace: cambia el estado activo/inactivo mediante el procedimiento común de catálogo.
        Task<CResult> ActivarInactivarAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: indica si el nombre ya existe en la empresa.
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
    }
}
