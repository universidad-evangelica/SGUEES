using System;
using System.Web.UI;
using DevExpress.XtraReports.Web;
using sgueesRpt.Layouts;
using sgueesRpt.Reports.SelectionHiring.SC_REQUISICION_PERSONAL;

namespace sgueesRpt.Layouts.SelectionHiring
{
	public partial class ImprimirRequisicion : Page
	{
		protected void Page_Load(object sender, EventArgs e)
		{
			string jwtError;
			if (!RptJwtValidator.TryValidate(Request, out jwtError))
			{
				ShowError(jwtError);
				return;
			}

			int corrEmpresa;
			int corrRequisicion;
			if (!int.TryParse(Request.QueryString["CORR_EMPRESA"], out corrEmpresa) || corrEmpresa <= 0)
			{
				ShowError("Parámetro CORR_EMPRESA inválido.");
				return;
			}
			if (!int.TryParse(Request.QueryString["CORR_REQUISICION_PERSONAL"], out corrRequisicion) || corrRequisicion <= 0)
			{
				ShowError("Parámetro CORR_REQUISICION_PERSONAL inválido.");
				return;
			}

			try
			{
				var report = new rptRequisicionPersonal();
				report.LoadFromDatabase(corrEmpresa, corrRequisicion);
				webDocumentViewer.OpenReport(report);
			}
			catch (Exception ex)
			{
				ShowError(ex.Message);
			}
		}

		private void ShowError(string message)
		{
			webDocumentViewer.Visible = false;
			litError.Visible = true;
			litError.Text =
				"<div id=\"errorBox\">" + Server.HtmlEncode(message) + "</div>" +
				"<script type=\"text/javascript\">" +
				"if (window.parent && window.parent !== window) {" +
				"  window.parent.postMessage({ type: 'sguees-rpt-ready', source: 'ImprimirRequisicion', error: true }, '*');" +
				"}" +
				"</script>";
		}
	}
}
