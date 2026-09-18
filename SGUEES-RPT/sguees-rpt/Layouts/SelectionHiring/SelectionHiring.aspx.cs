using System;
using System.Collections.Specialized;
using System.Web.UI;
using DevExpress.XtraReports.UI;
using sgueesRpt.Layouts;
using sgueesRpt.Reports.SelectionHiring.SC_REQUISICION_PERSONAL;

namespace sgueesRpt.Layouts.SelectionHiring
{
	/// <summary>
	/// Único visor XtraReports del módulo SelectionHiring (SPA).
	///
	/// URL:
	///   Layouts/SelectionHiring/SelectionHiring.aspx
	///     ?fuente=sc-requisicion-personal
	///     &amp;report=rptRequisicionPersonal
	///     [&amp;formato=corto]     // opcional: cuando una fuente tiene varios reportes
	///     &amp;CORR_...=...        // params que lea el case correspondiente
	///     &amp;token=JWT
	///
	/// ============================================================
	/// CÓMO AGREGAR UN REPORTE NUEVO (solo aquí + el .cs del XtraReport)
	/// ============================================================
	/// 1. Crear el XtraReport en Reports/SelectionHiring/...
	/// 2. Agregar un case en ResolveReport() más abajo (fuente / report / formato).
	/// 3. En SPA: buildSelectionHiringRptUrl({ fuente, report, formato?, params, token }).
	/// NO crear handlers ni ASPX adicionales por fuente.
	/// ============================================================
	/// </summary>
	public partial class SelectionHiring : Page
	{
		protected void Page_Load(object sender, EventArgs e)
		{
			string jwtError;
			if (!RptJwtValidator.TryValidate(Request, out jwtError))
			{
				ShowError(jwtError);
				return;
			}

			var fuente = (Request.QueryString["fuente"] ?? string.Empty).Trim();
			var report = (Request.QueryString["report"] ?? string.Empty).Trim();
			var formato = (Request.QueryString["formato"] ?? string.Empty).Trim();

			if (string.IsNullOrWhiteSpace(fuente))
			{
				ShowError("Parámetro fuente es obligatorio (ej. sc-requisicion-personal).");
				return;
			}
			if (string.IsNullOrWhiteSpace(report))
			{
				ShowError("Parámetro report es obligatorio (ej. rptRequisicionPersonal).");
				return;
			}

			try
			{
				string resolveError;
				var xtraReport = ResolveReport(fuente, report, formato, Request.QueryString, out resolveError);
				if (xtraReport == null)
				{
					ShowError(resolveError ?? "No se pudo resolver el reporte.");
					return;
				}

				// No disponer: el WebDocumentViewer mantiene vivo el XtraReport.
				webDocumentViewer.OpenReport(xtraReport);
			}
			catch (Exception ex)
			{
				ShowError(ex.Message);
			}
		}

		/// <summary>
		/// Resuelve fuente + report (+ formato) → XtraReport cargado.
		/// Agregar aquí cada reporte nuevo del módulo (un case).
		/// </summary>
		private static XtraReport ResolveReport(
			string fuente,
			string report,
			string formato,
			NameValueCollection query,
			out string errorMessage)
		{
			errorMessage = null;
			var key = BuildRouteKey(fuente, report, formato);

			// ----------------------------------------------------------------
			// REPORTES ACTIVOS — agregar cases abajo al crecer el módulo
			// Clave = fuente|report|formato (formato vacío si no aplica)
			// ----------------------------------------------------------------
			switch (key)
			{
				// sc-requisicion-personal → rptRequisicionPersonal
				case "sc-requisicion-personal|rptRequisicionPersonal|":
					return LoadRequisicionPersonal(query, out errorMessage);

				// Ejemplos futuros (descomentar cuando existan el XtraReport y el Load*):
				// case "sc-descriptor-puesto|rptDescriptorPuesto|corto":
				//     return LoadDescriptorPuestoCorto(query, out errorMessage);
				// case "sc-descriptor-puesto|rptDescriptorPuesto|extenso":
				//     return LoadDescriptorPuestoExtenso(query, out errorMessage);

				default:
					errorMessage =
						"Reporte no registrado en SelectionHiring.aspx: fuente='" + fuente
						+ "', report='" + report + "'"
						+ (string.IsNullOrWhiteSpace(formato) ? "" : (", formato='" + formato + "'"))
						+ ". Agregue el case en ResolveReport().";
					return null;
			}
		}

		private static string BuildRouteKey(string fuente, string report, string formato)
		{
			return (fuente ?? string.Empty).Trim().ToLowerInvariant()
				+ "|"
				+ (report ?? string.Empty).Trim()
				+ "|"
				+ (formato ?? string.Empty).Trim().ToLowerInvariant();
		}

		// ---- Loaders por reporte (params desde QueryString) ----------------

		private static XtraReport LoadRequisicionPersonal(NameValueCollection query, out string errorMessage)
		{
			errorMessage = null;
			int corrEmpresa;
			int corrRequisicion;
			if (!int.TryParse(query["CORR_EMPRESA"], out corrEmpresa) || corrEmpresa <= 0)
			{
				errorMessage = "Parámetro CORR_EMPRESA inválido.";
				return null;
			}
			if (!int.TryParse(query["CORR_REQUISICION_PERSONAL"], out corrRequisicion) || corrRequisicion <= 0)
			{
				errorMessage = "Parámetro CORR_REQUISICION_PERSONAL inválido.";
				return null;
			}

			var rpt = new rptRequisicionPersonal();
			rpt.LoadFromDatabase(corrEmpresa, corrRequisicion);
			return rpt;
		}

		// private static XtraReport LoadDescriptorPuestoCorto(NameValueCollection query, out string errorMessage) { ... }

		private void ShowError(string message)
		{
			webDocumentViewer.Visible = false;
			litError.Visible = true;
			litError.Text =
				"<div id=\"errorBox\">" + Server.HtmlEncode(message) + "</div>" +
				"<script type=\"text/javascript\">" +
				"if (window.parent && window.parent !== window) {" +
				"  window.parent.postMessage({ type: 'sguees-rpt-ready', source: 'SelectionHiring', error: true }, '*');" +
				"}" +
				"</script>";
		}
	}
}
