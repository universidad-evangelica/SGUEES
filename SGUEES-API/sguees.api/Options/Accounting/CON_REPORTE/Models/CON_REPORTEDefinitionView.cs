using System.Collections.Generic;

namespace sguees.Models
{
	public class CON_REPORTEDefinitionView
	{
		public string CODIGO_REPORTE { get; set; }
		public string TITULO { get; set; }
		public string STORED_PROCEDURE { get; set; }
		public string DESTINO { get; set; }
		public int OLEADA { get; set; }
		public bool SP_DISPONIBLE { get; set; }
		public string RPT_FILE { get; set; }
		public bool RPT_DISPONIBLE { get; set; }
		public bool CONSULTA_GRID { get; set; }
		public string URL_CONSULTA { get; set; }
		public string URL_REPORTE { get; set; }
		public string URL_OPCION { get; set; }
		public List<string> FILTROS { get; set; } = new List<string>();
	}
}
