using System.Web.Http;
using sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_CORTO;
using sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO;

namespace sgueesRpt.Controllers
{
	/// <summary>
	/// Reportes de Selección y Contratación.
	/// API -> PostScXxxImpr -> payload IMPR -> ReportClass + DataSet (mismo patrón Accounting/Shop).
	/// </summary>
	[RoutePrefix("api/SelectionHiring")]
	public class SelectionHiringController : ApiController
	{
		// Qué hace: genera PDF Formato corto del Descriptor de puesto.
		// Cómo: recibe payload con bloques desde SC_REPO y exporta con Crystal.
		[HttpPost]
		[Route("PostScDescriptorPuestoFormatoCortoImpr")]
		public IHttpActionResult PostScDescriptorPuestoFormatoCortoImpr(
			[FromBody] SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_IMPRPayload data)
		{
			return SC_DESCRIPTOR_PUESTO_FORMATO_CORTOReportExporter.ExportPdf(data, Request);
		}

		// Qué hace: genera PDF Formato extenso del Descriptor de puesto.
		// Cómo: recibe payload (encabezado) desde SC_REPO y exporta con Crystal.
		[HttpPost]
		[Route("PostScDescriptorPuestoFormatoExtensoImpr")]
		public IHttpActionResult PostScDescriptorPuestoFormatoExtensoImpr(
			[FromBody] SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRPayload data)
		{
			return SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSOReportExporter.ExportPdf(data, Request);
		}
	}
}
