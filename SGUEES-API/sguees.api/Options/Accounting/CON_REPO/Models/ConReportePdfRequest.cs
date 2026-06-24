using System.Collections.Generic;

namespace sguees.Models
{
	public class ConReportePdfRequest
	{
		public string RptName { get; set; }
		public List<Dictionary<string, object>> Data { get; set; } = new List<Dictionary<string, object>>();
		public string PdfFileName { get; set; }
	}
}
