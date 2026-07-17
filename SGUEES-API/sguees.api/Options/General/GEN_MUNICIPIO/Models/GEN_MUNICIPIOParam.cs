using eFramework.Data;

namespace SGUEES.Models
{
	// Parámetros de consulta/filtro de municipios (jerarquía territorial y grilla remota).
	public class GEN_MUNICIPIOParam : BaseParam
	{
		// Empresa de sesión para aislar el contexto.
		public int CORR_EMPRESA { get; set; }
		public int CORR_PAIS { get; set; }
		public int CORR_DEPTO { get; set; }
		// Clave del municipio.
		public int CORR_MUNICIPIO { get; set; }
		public string BUSQUEDA { get; set; }
		public string NOMBRE_MUNICIPIO { get; set; }
		public string CODIGO_MUNICIPIO { get; set; }
		// Filtro por código de departamento (lookups relacionados).
		public string CODIGO_DEPTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public string FECHA_ACTU { get; set; }
		// Opción y filtros remotos de grilla.
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
