using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IPLA_NIVEL_ACADEMICORepository : IRepository<PLA_NIVEL_ACADEMICOTable>
    {
        // Define el cambio de estado activo/inactivo del nivel académico.
        Task<CResult> ActivarInactivarAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la verificación de unicidad del nombre dentro de la empresa.
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
    }
}
