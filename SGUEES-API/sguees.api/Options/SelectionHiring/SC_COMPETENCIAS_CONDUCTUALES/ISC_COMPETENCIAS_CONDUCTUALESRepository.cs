// Qué hace: contrato del repositorio de competencias conductuales.
// Cómo: extiende IRepository<SC_COMPETENCIAS_CONDUCTUALESTable> y agrega ActivarInactivarAsync, ExistsNombreAsync y GetCatalogoDescriptorAsync.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
  public interface ISC_COMPETENCIAS_CONDUCTUALESRepository : IRepository<SC_COMPETENCIAS_CONDUCTUALESTable>
  {
    // Qué hace: define el cambio de estado activo/inactivo de la competencia conductual.
    Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    // Qué hace: define la verificación de unicidad del nombre dentro de la empresa.
    Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
    // Qué hace: define la consulta de competencias conductuales activas requerida por el descriptor de puesto.
    Task<List<SC_COMPETENCIAS_CONDUCTUALESView>> GetCatalogoDescriptorAsync(int corrEmpresa);
  }
}
