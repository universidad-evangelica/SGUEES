using System.Net.Http;
using System.Web.Http;
using sgueesRpt.Layouts;

namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO
{
	// Qué hace: exporta PDF del Descriptor Formato extenso.
	// Cómo: payload → DataSet (V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPR + GEN_PARAMETRO).
	public static class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSOReportExporter
	{
		public static IHttpActionResult ExportPdf(
			SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRPayload data,
			HttpRequestMessage request)
		{
			return ReportExportHelper.ExportPdfDataSet<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSOReport>(
				ScDescriptorPuestoFormatoExtensoReportData.CreateDataSet(data),
				request,
				"SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO.pdf");
		}
	}
}
