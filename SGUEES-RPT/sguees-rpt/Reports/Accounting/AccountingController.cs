using System.Collections.Generic;
using System.Web.Http;
using sgueesRpt.Reports.Accounting;
using sgueesRpt.Reports.Accounting.BALANCE_COMPROBACION;
using sgueesRpt.Reports.Accounting.BALANCE_COMPROBACION_MES;
using sgueesRpt.Reports.Accounting.BALANCE_GENERAL;
using sgueesRpt.Reports.Accounting.BALANCE_GENERAL_VERTICAL;
using sgueesRpt.Reports.Accounting.CON_GASTOS;
using sgueesRpt.Reports.Accounting.CON_PARTIDA;
using sgueesRpt.Reports.Accounting.ESTADO_RESULTADOS;
using sgueesRpt.Reports.Accounting.LIBRO_DIARIO_AUXILIAR;
using sgueesRpt.Reports.Accounting.LIBRO_DIARIO_AUXILIAR_MES;
using sgueesRpt.Reports.Accounting.LIBRO_DIARIO_MAYOR;

namespace sgueesRpt.Controllers
{
	/// <summary>
	/// Reportes contables. Mismo patron que Shop/Compras:
	/// API -> PostConXxxImpr -> List&lt;{REPORTE}_IMPRView&gt; -> ReportClass + DataSet.
	/// </summary>
	[RoutePrefix("api/Accounting")]
	public class AccountingController : ApiController
	{
		[HttpPost]
		[Route("PostConLibroDiarioAuxiliarImpr")]
		public IHttpActionResult PostConLibroDiarioAuxiliarImpr([FromBody] List<LIBRO_DIARIO_AUXILIAR_IMPRView> data)
		{
			return ConReportExportHelper.ExportPdf<LIBRO_DIARIO_AUXILIARReport, LIBRO_DIARIO_AUXILIAR_IMPRView>(
				data,
				"PRAL_IMPR_LIBRO_DIARIO_AUXILIAR",
				Request,
				"LIBRO_DIARIO_AUXILIAR.pdf");
		}

		[HttpPost]
		[Route("PostConLibroDiarioAuxiliarMesImpr")]
		public IHttpActionResult PostConLibroDiarioAuxiliarMesImpr([FromBody] List<LIBRO_DIARIO_AUXILIAR_MES_IMPRView> data)
		{
			return ConReportExportHelper.ExportPdf<LIBRO_DIARIO_AUXILIAR_MESReport, LIBRO_DIARIO_AUXILIAR_MES_IMPRView>(
				data,
				"PRAL_IMPR_LIBRO_DIARIO_AUXILIAR",
				Request,
				"LIBRO_DIARIO_AUXILIAR_MES.pdf");
		}

		[HttpPost]
		[Route("PostConLibroDiarioMayorImpr")]
		public IHttpActionResult PostConLibroDiarioMayorImpr([FromBody] List<LIBRO_DIARIO_MAYOR_IMPRView> data)
		{
			return ConReportExportHelper.ExportPdf<LIBRO_DIARIO_MAYORReport, LIBRO_DIARIO_MAYOR_IMPRView>(
				data,
				"PRAL_IMPR_LIBRO_DIARIO_MAYOR",
				Request,
				"LIBRO_DIARIO_MAYOR.pdf");
		}

		[HttpPost]
		[Route("PostConBalanceComprobacionImpr")]
		public IHttpActionResult PostConBalanceComprobacionImpr([FromBody] List<BALANCE_COMPROBACION_IMPRView> data)
		{
			return ConReportExportHelper.ExportPdf<BALANCE_COMPROBACIONReport, BALANCE_COMPROBACION_IMPRView>(
				data,
				"PRAL_IMPR_BALANCE_COMPROBACION",
				Request,
				"BALANCE_COMPROBACION.pdf");
		}

		[HttpPost]
		[Route("PostConBalanceComprobacionMesImpr")]
		public IHttpActionResult PostConBalanceComprobacionMesImpr([FromBody] List<BALANCE_COMPROBACION_MES_IMPRView> data)
		{
			return ConReportExportHelper.ExportPdf<BALANCE_COMPROBACION_MESReport, BALANCE_COMPROBACION_MES_IMPRView>(
				data,
				"PRAL_IMPR_BALANCE_COMPROBACION",
				Request,
				"BALANCE_COMPROBACION_MES.pdf");
		}

		[HttpPost]
		[Route("PostConBalanceGeneralImpr")]
		public IHttpActionResult PostConBalanceGeneralImpr([FromBody] List<BALANCE_GENERAL_IMPRView> data)
		{
			return ConReportExportHelper.ExportPdf<BALANCE_GENERALReport, BALANCE_GENERAL_IMPRView>(
				data,
				"PRAL_IMPR_BALANCE_GENERAL",
				Request,
				"BALANCE_GENERAL.pdf");
		}

		[HttpPost]
		[Route("PostConEstadoResultadosImpr")]
		public IHttpActionResult PostConEstadoResultadosImpr([FromBody] List<ESTADO_RESULTADOS_IMPRView> data)
		{
			return ConReportExportHelper.ExportPdf<ESTADO_RESULTADOSReport, ESTADO_RESULTADOS_IMPRView>(
				data,
				"PRAL_IMPR_ESTADO_RESULTADOS",
				Request,
				"ESTADO_RESULTADOS.pdf");
		}

		[HttpPost]
		[Route("PostConBalanceGeneralVerticalImpr")]
		public IHttpActionResult PostConBalanceGeneralVerticalImpr([FromBody] List<BALANCE_GENERAL_VERTICAL_IMPRView> data)
		{
			return ConReportExportHelper.ExportPdf<BALANCE_GENERAL_VERTICALReport, BALANCE_GENERAL_VERTICAL_IMPRView>(
				data,
				"PRAL_IMPR_ESTADO_RESULTADOS",
				Request,
				"BALANCE_GENERAL_VERTICAL.pdf");
		}

		[HttpPost]
		[Route("PostConGastosImpr")]
		public IHttpActionResult PostConGastosImpr([FromBody] List<CON_GASTOS_IMPRView> data)
		{
			return ConGastosReportExporter.ExportPdf(data, Request);
		}

		[HttpPost]
		[Route("PostConPartidaImpr")]
		public IHttpActionResult PostConPartidaImpr([FromBody] List<CON_PARTIDA_IMPRView> data)
		{
			return PARTIDA_CONTABLEReportExporter.ExportPdf(data, Request);
		}
	}
}
