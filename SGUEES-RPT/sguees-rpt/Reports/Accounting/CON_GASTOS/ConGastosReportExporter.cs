using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using sgueesRpt.Layouts;
using sgueesRpt.Models;
using sgueesRpt.Reports.Accounting;

namespace sgueesRpt.Reports.Accounting.CON_GASTOS
{
	public static class ConGastosReportExporter
	{
		public static IHttpActionResult ExportPdf(
			List<CON_GASTOS_IMPRView> data,
			HttpRequestMessage request)
		{
			return ReportExportHelper.ExportPdfDataSet<CON_REPORTE_GASTOSReport>(
				ConReportData.CreateDataSet(data, "V_CON_REPORTE_GASTOS"),
				request,
				"CON_REPORTE_GASTOS.pdf");
		}
	}
}
