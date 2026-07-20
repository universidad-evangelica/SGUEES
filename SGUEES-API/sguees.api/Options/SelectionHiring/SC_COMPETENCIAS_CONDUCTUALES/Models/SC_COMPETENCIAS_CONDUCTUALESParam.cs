// Qué hace: parámetros de consulta/filtro de competencia conductual.
// Cómo: extiende BaseParam con los campos usados para buscar, paginar y ordenar el catálogo.
using eFramework.Data;

namespace SGUEES.Models
{
  // Qué hace: representa los filtros y opciones de paginación/orden para consultar competencia conductual.
  // Cómo: además de las claves propias (CORR_EMPRESA, CORR_COMPETENCIAS_CONDUCTUALES), hereda de BaseParam los campos genéricos de búsqueda, filtros de grilla, paginación y orden.
  public class SC_COMPETENCIAS_CONDUCTUALESParam : BaseParam
  {
    public int CORR_EMPRESA { get; set; }
    public int CORR_COMPETENCIAS_CONDUCTUALES { get; set; }
    public int PAGE { get; set; } = 1;
    public int PAGE_SIZE { get; set; } = 10;
    public string SORT_FIELD { get; set; }
    public bool? SORT_DESC { get; set; }
  }
}
