using System.Collections.Generic;
using System.Web.Http;
using sgueesRpt.Layouts;
using sgueesRpt.Models;
using sgueesRpt.Reports.Accounting;
using sgueesRpt.Reports.Accounting.CON_PARTIDA;

namespace sgueesRpt.Controllers
{
	/// <summary>
	/// Reportes contables. Patron de invocacion (igual que Shop/Compras):
	/// API modulo -> CON_REPORepository.GetConXxxImprAsync -> PostConXxxImpr -> ExportPdf/Exportador dedicado.
	/// PostConReporteImpr/ByCodigo queda solo para reportes e-Admin pendientes de migrar.
	/// </summary>
	[RoutePrefix("api/Accounting")]
	public class AccountingController : ApiController
	{
		[HttpPost]
		[Route("PostConGastosImpr")]
		public IHttpActionResult PostConGastosImpr([FromBody] List<CON_GASTOS_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfFromFile(
				"Accounting",
				"CON_REPORTE_GASTOS",
				data,
				Request,
				"CON_REPORTE_GASTOS.pdf");
		}

		[HttpPost]
		[Route("PostConPartidaImpr")]
		public IHttpActionResult PostConPartidaImpr([FromBody] List<CON_PARTIDA_IMPRView> data)
		{
			return PARTIDA_CONTABLEReportExporter.ExportPdf(data, Request);
		}

		/// <summary>
		/// Exportacion PDF generica para reportes contables copiados desde e-Admin.
		/// </summary>
		[HttpPost]
		[Route("PostConReporteImpr")]
		public IHttpActionResult PostConReporteImpr([FromBody] ConReportePdfRequest request)
		{
			if (request == null || string.IsNullOrWhiteSpace(request.RptName))
			{
				return BadRequest("Indique RptName");
			}

			var rptName = request.RptName.Trim();
			if (rptName.EndsWith(".rpt", System.StringComparison.OrdinalIgnoreCase))
			{
				rptName = rptName.Substring(0, rptName.Length - 4);
			}

			var pdfName = string.IsNullOrWhiteSpace(request.PdfFileName)
				? rptName + ".pdf"
				: request.PdfFileName.Trim();

			return ReportExportHelper.ExportPdfFromFile(
				"Accounting",
				rptName,
				request.Data ?? new List<Dictionary<string, object>>(),
				Request,
				pdfName);
		}

		/// <summary>
		/// Atajo por codigo SGUEES (CON_GASTOS, CON_LIBRO_DIARIO, etc.).
		/// </summary>
		[HttpPost]
		[Route("PostConReporteImprByCodigo")]
		public IHttpActionResult PostConReporteImprByCodigo([FromBody] ConReportePdfRequest request)
		{
			if (request == null || string.IsNullOrWhiteSpace(request.RptName))
			{
				return BadRequest("Indique codigo de reporte en RptName");
			}

			if (!AccountingReports.TryGetRpt(request.RptName, out var rptName))
			{
				return BadRequest("Reporte Crystal no registrado: " + request.RptName);
			}

			request.RptName = rptName;
			if (string.IsNullOrWhiteSpace(request.PdfFileName))
			{
				request.PdfFileName = rptName + ".pdf";
			}

			return PostConReporteImpr(request);
		}
	}
}
