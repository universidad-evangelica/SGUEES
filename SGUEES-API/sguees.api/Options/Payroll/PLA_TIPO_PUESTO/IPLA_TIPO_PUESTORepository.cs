using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IPLA_TIPO_PUESTORepository : IRepository<PLA_TIPO_PUESTOTable>
    {
        // Define el cambio de estado activo/inactivo del tipo de puesto.
        Task<CResult> ActivarInactivarAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la verificación de unicidad del nombre dentro de la empresa.
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
        // Define la verificación de unicidad del código dentro de la empresa.
        Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
    }
}
