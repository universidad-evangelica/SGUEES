using System.Collections.Generic;
using System.Web.Http;
using sgueesRpt.Layouts;
using sgueesRpt.Models;
using sgueesRpt.Reports.Accounting.CON_PARTIDA.DxReports;

namespace sgueesRpt.Controllers
{
	/// <summary>
	/// Endpoints DevExpress de Contabilidad (disponibles aunque Crystal esté desactivado).
	/// </summary>
	[RoutePrefix("api/Accounting")]
	public class AccountingDxController : ApiController
	{
		/// <summary>
		/// Piloto DevExpress — misma ruta que AccountingController.PostConPartidaImprDx
		/// (este controller solo se compila con EnableCrystalReports=false).
		/// </summary>
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
