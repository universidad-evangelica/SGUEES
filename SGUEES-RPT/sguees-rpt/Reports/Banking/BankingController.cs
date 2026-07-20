using System.Collections.Generic;
using System.Web.Http;
using sgueesRpt.Reports.Accounting;
using sgueesRpt.Reports.Banking.BAN_CHEQUE_EMITIDOS;
using sgueesRpt.Reports.Banking.BAN_ENTREGA_CHEQUES;
using sgueesRpt.Reports.Banking.BAN_ESTADO_CUENTA;
using sgueesRpt.Reports.Banking.BAN_ESTADO_CUENTA_ACUMULADO;

namespace sgueesRpt.Controllers
{
	[RoutePrefix("api/Banking")]
	public class BankingController : ApiController
	{
		[HttpPost]
		[Route("PostBanChequeEmitidosImpr")]
		public IHttpActionResult PostBanChequeEmitidosImpr([FromBody] List<BAN_CHEQUE_EMITIDOS_IMPRView> data)
		{
			// e-Admin FillReport usa vViewName = "V_BAN_DOCUMENTO" (nombre tabla en el .rpt), no el SP.
			return ConReportExportHelper.ExportPdf<BAN_CHEQUE_EMITIDOSReport, BAN_CHEQUE_EMITIDOS_IMPRView>(
				data,
				"V_BAN_DOCUMENTO",
				Request,
				"BAN_CHEQUE_EMITIDOS.pdf");
		}

		[HttpPost]
		[Route("PostBanEstadoCuentaImpr")]
		public IHttpActionResult PostBanEstadoCuentaImpr([FromBody] List<BAN_ESTADO_CUENTA_IMPRView> data)
		{
			return ConReportExportHelper.ExportPdf<BAN_ESTADO_CUENTAReport, BAN_ESTADO_CUENTA_IMPRView>(
				data,
				"PRAL_IMPR_BAN_ESTADO_CUENTA",
				Request,
				"BAN_ESTADO_CUENTA.pdf");
		}

		[HttpPost]
		[Route("PostBanEstadoCuentaAcumuladoImpr")]
		public IHttpActionResult PostBanEstadoCuentaAcumuladoImpr([FromBody] List<BAN_ESTADO_CUENTA_ACUMULADO_IMPRView> data)
		{
			return ConReportExportHelper.ExportPdf<BAN_ESTADO_CUENTA_ACUMULADOReport, BAN_ESTADO_CUENTA_ACUMULADO_IMPRView>(
				data,
				"PRAL_IMPR_BAN_ESTADO_CUENTA_ACUMULADO",
				Request,
				"BAN_ESTADO_CUENTA_ACUMULADO.pdf");
		}

		[HttpPost]
		[Route("PostBanEntregaChequesImpr")]
		public IHttpActionResult PostBanEntregaChequesImpr([FromBody] List<BAN_ENTREGA_CHEQUES_IMPRView> data)
		{
			return ConReportExportHelper.ExportPdf<BAN_ENTREGA_CHEQUESReport, BAN_ENTREGA_CHEQUES_IMPRView>(
				data,
				"V_BAN_ENTREGA_CHEQUES",
				Request,
				"BAN_ENTREGA_CHEQUES.pdf");
		}
	}
}
