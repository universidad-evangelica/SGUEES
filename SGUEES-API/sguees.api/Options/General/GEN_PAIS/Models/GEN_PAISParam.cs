using eFramework.Data;

namespace SGUEES.Models
{
	// Filtros, paginación y parámetros de consulta del catálogo de país.
	public class GEN_PAISParam : BaseParam
	{
		public int CORR_PAIS { get; set; }
		// Texto libre de búsqueda aplicado sobre columnas principales.
		public string BUSQUEDA { get; set; }
		public string NOMBRE_PAIS { get; set; }
		public string CODIGO_PAIS { get; set; }
		public string NACIONALIDAD { get; set; }
		public string NOMBRE_CORTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public string FECHA_ACTU { get; set; }
		// Número de página solicitado por la grilla (1-based).
		public int PAGE { get; set; } = 1;
		// Tamaño de página; 0 indica devolver todos los registros.
		public int PAGE_SIZE { get; set; } = 10;
		// Opción de consulta especializada cuando el endpoint lo requiere.
		public int OPCION_CONSULTA { get; set; } = 0;
		// Campo usado cuando la consulta solicita valores distintos.
		public string DISTINCT_FIELD { get; set; }
		// Texto de búsqueda del header filter de la grilla.
		public string HEADER_FILTER_SEARCH { get; set; }
		// Filtros de pertenencia (any-of) por columna desde la grilla.
		public string COLUMN_ANYOF_JSON { get; set; }
		// Filtros de fila serializados desde DevExtreme.
		public string FILTER_ROW_JSON { get; set; }
		// Filtros exactos por columna serializados desde la grilla.
		public string COLUMN_EXACT_JSON { get; set; }
		// Campo por el que se ordena el resultado de la grilla.
		public string SORT_FIELD { get; set; }
		// Indica si el ordenamiento es descendente.
		public bool? SORT_DESC { get; set; }
	}
}
