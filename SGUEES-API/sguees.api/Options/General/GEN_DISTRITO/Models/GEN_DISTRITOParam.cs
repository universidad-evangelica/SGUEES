using eFramework.Data;

namespace SGUEES.Models
{
	// Qué hace: define los parámetros de consulta y filtro de distritos (jerarquía territorial y grilla remota).
	public class GEN_DISTRITOParam : BaseParam
	{
		// Qué hace: correlativo de empresa (filtro de ámbito).
		public int CORR_EMPRESA { get; set; }
		public int CORR_PAIS { get; set; }
		public int CORR_DEPTO { get; set; }
		public int CORR_MUNICIPIO { get; set; }
		// Qué hace: correlativo del distrito.
		public int CORR_DISTRITO { get; set; }
		public string BUSQUEDA { get; set; }
		public string NOMBRE_DISTRITO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public string FECHA_ACTU { get; set; }
		// Qué hace: opción y filtros remotos de grilla.
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
