using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using CrystalDecisions.CrystalReports.Engine;
using sgueesRpt.Layouts;
using sgueesRpt.Models;

namespace sgueesRpt.Reports.Accounting
{
	/// <summary>
	/// Exportador contable alineado con Shop (modelo tipado + ReportClass embebido).
	/// </summary>
	public static class ConReportExportHelper
	{
		public static IHttpActionResult ExportPdf<TReport>(
			List<CON_REPORTE_IMPRView> data,
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
