// Qué hace: parámetros de consulta/filtro de frecuencia.
// Cómo: extiende BaseParam con los campos usados para buscar, paginar y ordenar el catálogo.
using eFramework.Data;

namespace SGUEES.Models
{
    // Qué hace: representa los filtros y opciones de paginación/orden para consultar frecuencia.
    // Cómo: además de las claves propias (CORR_EMPRESA, CORR_FRECUENCIA), hereda de BaseParam los campos genéricos de búsqueda, filtros de grilla, paginación y orden.
    public class SC_FRECUENCIAParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_FRECUENCIA { get; set; }
        public string BUSQUEDA { get; set; }
        public string NOMBRE_FRECUENCIA { get; set; }
        // Filtra por estado activo/inactivo cuando se informa.
        public bool? ESTADO_FRECUENCIA { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public string FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public string FECHA_ACTU { get; set; }
        public int PAGE { get; set; } = 1;
        public int PAGE_SIZE { get; set; } = 10;
        public int OPCION_CONSULTA { get; set; } = 0;
        public string DISTINCT_FIELD { get; set; }
        public string HEADER_FILTER_SEARCH { get; set; }
        public string COLUMN_ANYOF_JSON { get; set; }
        public string FILTER_ROW_JSON { get; set; }
        public string COLUMN_EXACT_JSON { get; set; }
        public string SORT_FIELD { get; set; }
        public bool? SORT_DESC { get; set; }
    }
}
