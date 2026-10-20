using System.Collections.Generic;
using System.Web.Http;
using sgueesRpt.Layouts;
using sgueesRpt.Models;
using sgueesRpt.Reports.Accounting.CON_PARTIDA.DxReports;

namespace sgueesRpt.Controllers
{
	/// <summary>
	/// Piloto DevExpress — solo se compila con EnableDevExpress=true.
	/// En IIS 250 dejar EnableDevExpress=false (DX tumba el AppPool sin runtime instalado).
	/// </summary>
	[RoutePrefix("api/Accounting")]
	public class AccountingPartidaDxController : ApiController
	{
		[HttpPost]
		[Route("PostConPartidaImprDx")]
		public IHttpActionResult PostConPartidaImprDx([FromBody] List<CON_PARTIDA_IMPRView> data)
		{
			return DevExpressReportExportHelper.ExportPdf(
				() => new PARTIDA_CONTABLE_DXReport(),
				(report, rows) => ((PARTIDA_CONTABLE_DXReport)report).Bind(rows),
				data,
				Request,
				"PARTIDA_CONTABLE_DX.pdf");
		}
	}
}
