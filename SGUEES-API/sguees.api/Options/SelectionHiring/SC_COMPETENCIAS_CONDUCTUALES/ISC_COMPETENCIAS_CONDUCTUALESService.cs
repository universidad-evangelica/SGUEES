using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
  public interface ISC_COMPETENCIAS_CONDUCTUALESService
  {
    // Define la consulta del listado de competencias conductuales según los filtros recibidos.
    Task<CResult> GetAllAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere);
    // Define la consulta de una competencia conductual específica por sus claves.
    Task<CResult> GetAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere);
    // Define la creación validada de una competencia conductual con su información de auditoría.
    Task<CResult> CreateAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    // Define la actualización validada de una competencia conductual con su información de auditoría.
    Task<CResult> UpdateAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    // Define la eliminación de una competencia conductual identificada por sus claves.
    Task<CResult> DeleteAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    // Define el cambio de estado activo/inactivo de la competencia conductual.
    Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    // Define la consulta del catálogo activo para el descriptor de puesto.
    Task<CResult> GetCatalogoDescriptorAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere);
  }
}
