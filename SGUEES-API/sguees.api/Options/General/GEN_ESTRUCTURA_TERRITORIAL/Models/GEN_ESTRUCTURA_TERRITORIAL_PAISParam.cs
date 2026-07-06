using eFramework.Data;

namespace SGUEES.Models
{
	public class GEN_ESTRUCTURA_TERRITORIAL_PAISParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PAIS { get; set; }
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
