using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: define los parámetros de consulta y filtro de divisiones.
	public class GEN_DIVISIONParam : BaseParam
	{
		// Qué hace: correlativo de empresa (filtro de ámbito).
		public int CORR_EMPRESA { get; set; }
		// Qué hace: correlativo de la división.
		public int CORR_DIVISION { get; set; }
		public string BUSQUEDA { get; set; }
		public string NOMBRE_DIVISION { get; set; }
		public string CODIGO_DIVISION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public string FECHA_ACTU { get; set; }
		// Qué hace: parámetros de paginación y filtros remotos de grilla.
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
