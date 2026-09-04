using System.Collections.Generic;
using System.Web.Http;
using sgueesRpt.Layouts;
using sgueesRpt.Models;
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
	/// Reportes contables.
	/// Contrato API = Compras (List&lt;{REPORTE}_IMPRView&gt;).
	/// Push runtime = tablas embebidas en .rpt (detalle + GEN_PARAMETRO) hasta migrar Crystal Designer.
	/// </summary>
	[RoutePrefix("api/Accounting")]
	public class AccountingController : ApiController
	{
		[HttpPost]
		[Route("PostConLibroDiarioAuxiliarImpr")]
		public IHttpActionResult PostConLibroDiarioAuxiliarImpr([FromBody] List<LIBRO_DIARIO_AUXILIAR_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<LIBRO_DIARIO_AUXILIARReport, LIBRO_DIARIO_AUXILIAR_IMPRView>(
				data,
				Request,
				"LIBRO_DIARIO_AUXILIAR.pdf",
				"PRAL_IMPR_LIBRO_DIARIO_AUXILIAR",
				"Libro Diario Auxiliar");
		}

		[HttpPost]
		[Route("PostConLibroDiarioAuxiliarMesImpr")]
		public IHttpActionResult PostConLibroDiarioAuxiliarMesImpr([FromBody] List<LIBRO_DIARIO_AUXILIAR_MES_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<LIBRO_DIARIO_AUXILIAR_MESReport, LIBRO_DIARIO_AUXILIAR_MES_IMPRView>(
				data,
				Request,
				"LIBRO_DIARIO_AUXILIAR_MES.pdf",
				"PRAL_IMPR_LIBRO_DIARIO_AUXILIAR",
				"Libro Diario Auxiliar por Mes");
		}

		[HttpPost]
		[Route("PostConLibroDiarioMayorImpr")]
		public IHttpActionResult PostConLibroDiarioMayorImpr([FromBody] List<LIBRO_DIARIO_MAYOR_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<LIBRO_DIARIO_MAYORReport, LIBRO_DIARIO_MAYOR_IMPRView>(
				data,
				Request,
				"LIBRO_DIARIO_MAYOR.pdf",
				"PRAL_IMPR_LIBRO_DIARIO_MAYOR",
				"Libro Diario Mayor");
		}

		[HttpPost]
		[Route("PostConBalanceComprobacionImpr")]
		public IHttpActionResult PostConBalanceComprobacionImpr([FromBody] List<BALANCE_COMPROBACION_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<BALANCE_COMPROBACIONReport, BALANCE_COMPROBACION_IMPRView>(
				data,
				Request,
				"BALANCE_COMPROBACION.pdf",
				"PRAL_IMPR_BALANCE_COMPROBACION",
				"Balance de Comprobacion");
		}

		[HttpPost]
		[Route("PostConBalanceComprobacionMesImpr")]
		public IHttpActionResult PostConBalanceComprobacionMesImpr([FromBody] List<BALANCE_COMPROBACION_MES_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<BALANCE_COMPROBACION_MESReport, BALANCE_COMPROBACION_MES_IMPRView>(
				data,
				Request,
				"BALANCE_COMPROBACION_MES.pdf",
				"PRAL_IMPR_BALANCE_COMPROBACION",
				"Balance de Comprobacion por Mes");
		}

		[HttpPost]
		[Route("PostConBalanceGeneralImpr")]
		public IHttpActionResult PostConBalanceGeneralImpr([FromBody] List<BALANCE_GENERAL_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<BALANCE_GENERALReport, BALANCE_GENERAL_IMPRView>(
				data,
				Request,
				"BALANCE_GENERAL.pdf",
				"PRAL_IMPR_BALANCE_GENERAL",
				"Balance General");
		}

		[HttpPost]
		[Route("PostConEstadoResultadosImpr")]
		public IHttpActionResult PostConEstadoResultadosImpr([FromBody] List<ESTADO_RESULTADOS_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<ESTADO_RESULTADOSReport, ESTADO_RESULTADOS_IMPRView>(
				data,
				Request,
				"ESTADO_RESULTADOS.pdf",
				"PRAL_IMPR_ESTADO_RESULTADOS",
				"Estado de Resultados");
		}

		[HttpPost]
		[Route("PostConBalanceGeneralVerticalImpr")]
		public IHttpActionResult PostConBalanceGeneralVerticalImpr([FromBody] List<BALANCE_GENERAL_VERTICAL_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<BALANCE_GENERAL_VERTICALReport, BALANCE_GENERAL_VERTICAL_IMPRView>(
				data,
				Request,
				"BALANCE_GENERAL_VERTICAL.pdf",
				"PRAL_IMPR_ESTADO_RESULTADOS",
				"Balance General Vertical");
		}

		[HttpPost]
		[Route("PostConGastosImpr")]
		public IHttpActionResult PostConGastosImpr([FromBody] List<CON_GASTOS_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<CON_REPORTE_GASTOSReport, CON_GASTOS_IMPRView>(
				data,
				Request,
				"CON_REPORTE_GASTOS.pdf",
				"V_CON_REPORTE_GASTOS",
				"Reporte de Gastos");
		}

		[HttpPost]
		[Route("PostConPartidaImpr")]
		public IHttpActionResult PostConPartidaImpr([FromBody] List<CON_PARTIDA_IMPRView> data)
		{
			return ReportExportHelper.ExportPdfLegacy<PARTIDA_CONTABLEReport, CON_PARTIDA_IMPRView>(
				data,
				Request,
				"PARTIDA_CONTABLE.pdf",
				"V_CON_PARTIDA_IMPR",
				"Partida Contable");
		}
	}
}
