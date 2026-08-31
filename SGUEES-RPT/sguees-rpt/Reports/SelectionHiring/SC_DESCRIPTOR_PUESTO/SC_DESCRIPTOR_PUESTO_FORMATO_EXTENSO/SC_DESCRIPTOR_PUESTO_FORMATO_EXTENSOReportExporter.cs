using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using sgueesRpt.Layouts;

namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO
{
	// Qué hace: exporta PDF del Descriptor Formato extenso.
	// Cómo: DataSet compartido (V_SC_DESCRIPTOR_PUESTO_IMPR + GEN_PARAMETRO) → ReportExportHelper;
	//       los bloques uno-a-muchos del extenso se agregarán como tablas de subinformes.
	public static class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSOReportExporter
	{
		private const string TituloReporte = "Descriptor de Puesto - Formato extenso";

		public static IHttpActionResult ExportPdf(
			List<SC_DESCRIPTOR_PUESTO_IMPRView> data,
			HttpRequestMessage request)
		{
			return ReportExportHelper.ExportPdfDataSet<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSOReport>(
				ScDescriptorPuestoReportData.CreateDataSet(data, TituloReporte),
				request,
				"SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO.pdf");
		}
	}
}
