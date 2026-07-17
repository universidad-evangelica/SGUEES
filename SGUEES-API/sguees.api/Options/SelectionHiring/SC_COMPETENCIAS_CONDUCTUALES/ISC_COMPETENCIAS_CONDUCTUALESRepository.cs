// Contrato del repositorio de competencias conductuales.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
  public interface ISC_COMPETENCIAS_CONDUCTUALESRepository : IRepository<SC_COMPETENCIAS_CONDUCTUALESTable>
  {
    // Define el cambio de estado activo/inactivo de la competencia conductual.
    Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    // Define la verificación de unicidad del nombre dentro de la empresa.
    Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
    Task<List<SC_COMPETENCIAS_CONDUCTUALESView>> GetCatalogoDescriptorAsync(int corrEmpresa);
  }
}
