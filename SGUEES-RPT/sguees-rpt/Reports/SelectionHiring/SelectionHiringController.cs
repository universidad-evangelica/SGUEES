using System.Collections.Generic;
using System.Web.Http;
using sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO;
using sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_CORTO;

namespace sgueesRpt.Controllers
{
	/// <summary>
	/// Reportes de Selección y Contratación.
	/// API -> PostScXxxImpr -> List&lt;IMPRView&gt; -> ReportClass + DataSet (mismo patrón Accounting/Shop).
	/// </summary>
	[RoutePrefix("api/SelectionHiring")]
	public class SelectionHiringController : ApiController
	{
		// Qué hace: genera PDF Formato corto del Descriptor de puesto.
		// Cómo: recibe List IMPRView desde SC_REPO y exporta con Crystal.
		[HttpPost]
		[Route("PostScDescriptorPuestoFormatoCortoImpr")]
		public IHttpActionResult PostScDescriptorPuestoFormatoCortoImpr(
			[FromBody] List<SC_DESCRIPTOR_PUESTO_IMPRView> data)
		{
			return SC_DESCRIPTOR_PUESTO_FORMATO_CORTOReportExporter.ExportPdf(data, Request);
		}
	}
}
