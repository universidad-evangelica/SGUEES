using System.Collections.Generic;
using System.Web.Http;
using sgueesRpt.Layouts;
using sgueesRpt.Models;
using sgueesRpt.Reports.Shop.COM_CUADRO_COMPARATIVO;
using sgueesRpt.Reports.Shop.COM_ORDEN_COMPRA;
using sgueesRpt.Reports.Shop.COM_SOLI_COTIZACION;
using sgueesRpt.Reports.Shop.COM_VL_FSEE;

namespace sgueesRpt.Controllers
{
	[RoutePrefix("api/Shop")]
	public class ShopController : ApiController
	{
		[HttpPost]
		[Route("PostComSoliCotizacionImpr")]
		public IHttpActionResult PostComSoliCotizacionImpr([FromBody] List<COM_SOLI_COTIZACION_IMPRView> data)
		{
			return ReportExportHelper.ExportPdf<COM_SOLI_COTIZACIONReport, COM_SOLI_COTIZACION_IMPRView>(
				data,
				Request,
				"COM_SOLI_COTIZACION.pdf");
		}

		[HttpPost]
		[Route("PostComCuadroComparativoImpr")]
		public IHttpActionResult PostComCuadroComparativoImpr([FromBody] List<COM_CUADRO_COMPARATIVO_IMPRView> data)
		{
			return ReportExportHelper.ExportPdf<COM_CUADRO_COMPARATIVOReport, COM_CUADRO_COMPARATIVO_IMPRView>(
				data,
				Request,
				"COM_CUADRO_COMPARATIVO.pdf",
				report =>
				{
					if (data == null || data.Count == 0 || data[0].TOTAL_PROVEEDORES == null)
					{
						return;
					}

					report.OpenSubreport("COM_CUADRO_COMPARATIVO_TOTALReport.rpt")
						.SetDataSource(Utils.CreateDataTable(data[0].TOTAL_PROVEEDORES));
				});
		}

		[HttpPost]
		[Route("PostComCuadroComparativoOrdenCompraImpr")]
		public IHttpActionResult PostComCuadroComparativoOrdenCompraImpr([FromBody] List<COM_ORDEN_COMPRA_IMPRView> data)
		{
			return ReportExportHelper.ExportPdf<COM_ORDEN_COMPRAReport, COM_ORDEN_COMPRA_IMPRView>(
				data,
				Request,
				"COM_ORDEN_COMPRA.pdf");
		}

		[HttpPost]
		[Route("PostRepo_Sujeto_Excluido")]
		public IHttpActionResult PostRepo_Sujeto_Excluido([FromBody] List<COM_REPO_SUJETO_EXCLUIDOView> data)
		{
			return ReportExportHelper.ExportPdfFromFile(
				"Shop",
				"COM_REPO_SUJETO_EXCLUIDOReport",
				data,
				Request,
				"COM_REPO_SUJETO_EXCLUIDO.pdf");
		}

		[HttpPost]
		[Route("PostVL_FSEE")]
		public IHttpActionResult PostVL_FSEE([FromBody] List<COM_VL_FSEEView> data)
		{
			return ReportExportHelper.ExportPdf<COM_VL_FSEEReport, COM_VL_FSEEView>(
				data,
				Request,
				"COM_VL_FSEE.pdf");
		}

		[HttpPost]
		[Route("PostCuerpoCorreoPDFJSON")]
		public IHttpActionResult PostCuerpoCorreoPDFJSON([FromBody] COM_CORREO_PDFJSONView data)
		{
			return Ok(data);
		}
	}
}
