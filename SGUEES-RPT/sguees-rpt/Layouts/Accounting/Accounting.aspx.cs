using System;
using System.Collections.Specialized;
using System.Web.UI;
using DevExpress.XtraReports.UI;
using DevExpress.XtraReports.Web;
using sgueesRpt.Layouts;
using sgueesRpt.Reports.Accounting.CON_PARTIDA.DxReports;

namespace sgueesRpt.Layouts.Accounting
{
	/// <summary>
	/// Único visor XtraReports del módulo Accounting (SPA).
	///
	/// URL:
	///   Layouts/Accounting/Accounting.aspx
	///     ?fuente=con-partida
	///     &amp;report=rptPartidaContable
	///     [&amp;formato=...]     // opcional: cuando una fuente tiene varios reportes
	///     &amp;CORR_...=...      // params que lea el case correspondiente
	///     &amp;token=JWT
	///
	/// ============================================================
	/// CÓMO AGREGAR UN REPORTE NUEVO (solo aquí + el .cs del XtraReport)
	/// ============================================================
	/// 1. Crear el XtraReport en Reports/Accounting/...
	/// 2. Agregar un case en ResolveReport() más abajo (fuente / report / formato).
	/// 3. En SPA: buildAccountingRptUrl({ fuente, report, formato?, params, token }).
	/// NO crear handlers ni ASPX adicionales por fuente.
	/// ============================================================
	/// </summary>
	public partial class Accounting : Page
	{
		private static bool _viewerInitialized;

		protected void Page_Load(object sender, EventArgs e)
		{
			if (!_viewerInitialized)
			{
				ASPxWebDocumentViewer.StaticInitialize();
				_viewerInitialized = true;
			}

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
				ShowError("Parámetro fuente es obligatorio (ej. con-partida).");
				return;
			}
			if (string.IsNullOrWhiteSpace(report))
			{
				ShowError("Parámetro report es obligatorio (ej. rptPartidaContable).");
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
				// con-partida → rptPartidaContable (PARTIDA_CONTABLE_DXReport)
				case "con-partida|rptPartidaContable|":
					return LoadPartidaContable(query, out errorMessage);

				default:
					errorMessage =
						"Reporte no registrado en Accounting.aspx: fuente='" + fuente
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

		private static XtraReport LoadPartidaContable(NameValueCollection query, out string errorMessage)
		{
			errorMessage = null;
			int corrEmpresa;
			int anioPeriodo;
			int mesPeriodo;
			int corrClasePartida;
			int corrPartida;

			if (!int.TryParse(query["CORR_EMPRESA"], out corrEmpresa) || corrEmpresa <= 0)
			{
				errorMessage = "Parámetro CORR_EMPRESA inválido.";
				return null;
			}
			if (!int.TryParse(query["ANIO_PERIODO"], out anioPeriodo) || anioPeriodo <= 0)
			{
				errorMessage = "Parámetro ANIO_PERIODO inválido.";
				return null;
			}
			if (!int.TryParse(query["MES_PERIODO"], out mesPeriodo) || mesPeriodo <= 0)
			{
				errorMessage = "Parámetro MES_PERIODO inválido.";
				return null;
			}
			if (!int.TryParse(query["CORR_CLASE_PARTIDA"], out corrClasePartida) || corrClasePartida <= 0)
			{
				errorMessage = "Parámetro CORR_CLASE_PARTIDA inválido.";
				return null;
			}
			if (!int.TryParse(query["CORR_PARTIDA"], out corrPartida) || corrPartida <= 0)
			{
				errorMessage = "Parámetro CORR_PARTIDA inválido.";
				return null;
			}

			var rpt = new PARTIDA_CONTABLE_DXReport();
			rpt.LoadFromDatabase(corrEmpresa, anioPeriodo, mesPeriodo, corrClasePartida, corrPartida);
			return rpt;
		}

		private void ShowError(string message)
		{
			webDocumentViewer.Visible = false;
			litError.Visible = true;
			litError.Text =
				"<div id=\"errorBox\">" + Server.HtmlEncode(message) + "</div>" +
				"<script type=\"text/javascript\">" +
				"if (window.parent && window.parent !== window) {" +
				"  window.parent.postMessage({ type: 'sguees-rpt-ready', source: 'Accounting', error: true }, '*');" +
				"}" +
				"</script>";
		}
	}
}
