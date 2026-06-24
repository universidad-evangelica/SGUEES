using System.Collections.Generic;

namespace sgueesRpt.Models
{
	public class ConReportePdfRequest
	{
		/// <summary>Nombre del archivo .rpt sin extension (ej. CON_REPORTE_GASTOS).</summary>
		public string RptName { get; set; }

		/// <summary>Filas del dataset principal para Crystal.</summary>
		public List<Dictionary<string, object>> Data { get; set; }

		/// <summary>Nombre del PDF de salida (opcional).</summary>
		public string PdfFileName { get; set; }
	}
}
