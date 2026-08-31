using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using sgueesRpt.Layouts;

namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_CORTO
{
	// Qué hace: exporta PDF del Descriptor Formato corto.
	// Cómo: DataSet (V_SC_DESCRIPTOR_PUESTO_IMPR + GEN_PARAMETRO) → ReportExportHelper (patrón partida).
	public static class SC_DESCRIPTOR_PUESTO_FORMATO_CORTOReportExporter
	{
		public static IHttpActionResult ExportPdf(
			List<SC_DESCRIPTOR_PUESTO_IMPRView> data,
			HttpRequestMessage request)
		{
			return ReportExportHelper.ExportPdfDataSet<SC_DESCRIPTOR_PUESTO_FORMATO_CORTOReport>(
				ScDescriptorPuestoReportData.CreateDataSet(
					data,
					"Descriptor de Puesto - Formato corto"),
				request,
				"SC_DESCRIPTOR_PUESTO_FORMATO_CORTO.pdf");
		}
	}
}
