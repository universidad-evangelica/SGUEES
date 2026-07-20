using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using CrystalDecisions.CrystalReports.Engine;
using sgueesRpt.Layouts;

namespace sgueesRpt.Reports.Accounting
{
	/// <summary>
	/// Exportador contable alineado con Shop (modelo tipado por reporte + ReportClass embebido).
	/// </summary>
	public static class ConReportExportHelper
	{
		public static IHttpActionResult ExportPdf<TReport, TData>(
			List<TData> data,
			string detailTableName,
			HttpRequestMessage request,
			string pdfFileName)
			where TReport : ReportClass, new()
		{
			return ReportExportHelper.ExportPdfDataSet<TReport>(
				ConReportData.CreateDataSet(data, detailTableName),
				request,
				pdfFileName);
		}
	}
}
