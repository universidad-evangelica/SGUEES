using eFramework.Data;

namespace SGUEES.Models
{
	// Filtros, paginación y parámetros de consulta del catálogo de distrito.
	public class GEN_DISTRITOParam : BaseParam
	{
		// Empresa de la sesión que aísla los datos del catálogo.
		public int CORR_EMPRESA { get; set; }
		public int CORR_PAIS { get; set; }
		public int CORR_DEPTO { get; set; }
		public int CORR_MUNICIPIO { get; set; }
		public int CORR_DISTRITO { get; set; }
		// Texto libre de búsqueda aplicado sobre columnas principales.
		public string BUSQUEDA { get; set; }
		public string NOMBRE_DISTRITO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public string FECHA_ACTU { get; set; }
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
