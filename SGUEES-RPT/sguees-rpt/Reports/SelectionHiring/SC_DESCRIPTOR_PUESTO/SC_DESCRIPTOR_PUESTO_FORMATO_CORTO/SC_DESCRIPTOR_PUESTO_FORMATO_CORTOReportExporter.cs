using System.Net.Http;
using System.Web.Http;
using sgueesRpt.Layouts;

namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_CORTO
{
	// Qué hace: exporta PDF del Descriptor Formato corto.
	// Cómo: ScDescriptorPuestoFormatoCortoReportData → ReportExportHelper.
	public static class SC_DESCRIPTOR_PUESTO_FORMATO_CORTOReportExporter
	{
		public static IHttpActionResult ExportPdf(
			SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_IMPRPayload data,
			HttpRequestMessage request)
		{
			return ReportExportHelper.ExportPdfDataSet<SC_DESCRIPTOR_PUESTO_FORMATO_CORTOReport>(
				ScDescriptorPuestoFormatoCortoReportData.CreateDataSet(data),
				request,
				"SC_DESCRIPTOR_PUESTO_FORMATO_CORTO.pdf");
		}
	}
}
