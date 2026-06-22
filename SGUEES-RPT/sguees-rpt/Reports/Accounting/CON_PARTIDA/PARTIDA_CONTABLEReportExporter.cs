using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using sgueesRpt.Layouts;
using sgueesRpt.Models;

namespace sgueesRpt.Reports.Accounting.CON_PARTIDA
{
	/// <summary>
	/// Exportador del reporte Partida Contable.
	/// Encapsula el DataSet e-Admin (V_CON_PARTIDA_IMPR + GEN_PARAMETRO).
	/// La invocacion externa sigue el mismo contrato que Compras: List&lt;CON_PARTIDA_IMPRView&gt;.
	/// </summary>
	public static class PARTIDA_CONTABLEReportExporter
	{
		public static IHttpActionResult ExportPdf(
			List<CON_PARTIDA_IMPRView> data,
			HttpRequestMessage request)
		{
			return ReportExportHelper.ExportPdfDataSet<PARTIDA_CONTABLEReport>(
				ConPartidaReportData.CreateDataSet(data),
				request,
				"PARTIDA_CONTABLE.pdf");
		}
	}
}
