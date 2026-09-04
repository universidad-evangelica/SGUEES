using System.Collections.Generic;
using System.Web.Http;
using sgueesRpt.Layouts;
using sgueesRpt.Models;
using sgueesRpt.Reports.Banking.BAN_CHEQUE_EMITIDOS;
using sgueesRpt.Reports.Banking.BAN_ENTREGA_CHEQUES;
using sgueesRpt.Reports.Banking.BAN_ESTADO_CUENTA;
using sgueesRpt.Reports.Banking.BAN_ESTADO_CUENTA_ACUMULADO;

namespace sgueesRpt.Controllers
{
	/// <summary>
	/// Reportes bancarios.
	/// Contrato API = Compras (List&lt;{REPORTE}_IMPRView&gt;).
	/// Push runtime = tablas embebidas en .rpt (detalle + GEN_PARAMETRO) hasta migrar Crystal Designer.
	/// </summary>
	[RoutePrefix("api/Banking")]
	public class BankingController : ApiController
	{
		[HttpPost]
		[Route("PostBanChequeEmitidosImpr")]
		public IHttpActionResult PostBanChequeEmitidosImpr([FromBody] List<BAN_CHEQUE_EMITIDOS_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<BAN_CHEQUE_EMITIDOSReport, BAN_CHEQUE_EMITIDOS_IMPRView>(
				data,
				Request,
				"BAN_CHEQUE_EMITIDOS.pdf",
				"V_BAN_DOCUMENTO",
				"Cheques Emitidos");
		}

		[HttpPost]
		[Route("PostBanEstadoCuentaImpr")]
		public IHttpActionResult PostBanEstadoCuentaImpr([FromBody] List<BAN_ESTADO_CUENTA_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<BAN_ESTADO_CUENTAReport, BAN_ESTADO_CUENTA_IMPRView>(
				data,
				Request,
				"BAN_ESTADO_CUENTA.pdf",
				"PRAL_IMPR_BAN_ESTADO_CUENTA",
				"Estado de Cuenta");
		}

		[HttpPost]
		[Route("PostBanEstadoCuentaAcumuladoImpr")]
		public IHttpActionResult PostBanEstadoCuentaAcumuladoImpr([FromBody] List<BAN_ESTADO_CUENTA_ACUMULADO_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<BAN_ESTADO_CUENTA_ACUMULADOReport, BAN_ESTADO_CUENTA_ACUMULADO_IMPRView>(
				data,
				Request,
				"BAN_ESTADO_CUENTA_ACUMULADO.pdf",
				"PRAL_IMPR_BAN_ESTADO_CUENTA_ACUMULADO",
				"Estado de Cuenta Acumulado");
		}

		[HttpPost]
		[Route("PostBanEntregaChequesImpr")]
		public IHttpActionResult PostBanEntregaChequesImpr([FromBody] List<BAN_ENTREGA_CHEQUES_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<BAN_ENTREGA_CHEQUESReport, BAN_ENTREGA_CHEQUES_IMPRView>(
				data,
				Request,
				"BAN_ENTREGA_CHEQUES.pdf",
				"V_BAN_ENTREGA_CHEQUES",
				"Entrega de Cheques");
		}
	}
}
