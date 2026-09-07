using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DevExpress.XtraReports.UI;
using sgueesRpt.Controllers;

namespace sgueesRpt.Layouts
{
	/// <summary>
	/// Exportación PDF con DevExpress XtraReports (piloto; Crystal sigue activo en paralelo).
	/// </summary>
	public static class DevExpressReportExportHelper
	{
		public static IHttpActionResult ExportPdf<TData>(
			Func<XtraReport> createReport,
			Action<XtraReport, List<TData>> bindData,
			List<TData> data,
			HttpRequestMessage request,
			string pdfFileName)
		{
			if (data == null || data.Count == 0)
			{
				return new System.Web.Http.Results.ResponseMessageResult(
					request.CreateErrorResponse(HttpStatusCode.BadRequest, "No hay datos para imprimir."));
			}

			using (var report = createReport())
			{
				bindData(report, data);
				var stream = new MemoryStream();
				report.ExportToPdf(stream);
				stream.Position = 0;
				return new eDocResult(stream, request, pdfFileName);
			}
		}
	}
}
