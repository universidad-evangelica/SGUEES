using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using DevExpress.XtraReports.UI;
using sgueesRpt.Models;

namespace sgueesRpt.Reports.Accounting.CON_PARTIDA.DxReports
{
	/// <summary>
	/// Partida contable DevExpress — diseño en PARTIDA_CONTABLE_DXReport.Designer.cs (visible en [Diseño] de VS).
	/// </summary>
	public partial class PARTIDA_CONTABLE_DXReport : XtraReport
	{
		public PARTIDA_CONTABLE_DXReport()
		{
			InitializeComponent();
			ConfigureParameters();
		}

		public void Bind(List<CON_PARTIDA_IMPRView> rows)
		{
			var data = rows ?? new List<CON_PARTIDA_IMPRView>();
			var first = data.FirstOrDefault();
			if (first != null)
			{
				Parameters["NOMBRE_EMPRESA"].Value = first.NOMBRE_EMPRESA ?? string.Empty;
				Parameters["TITULO_REPORTE"].Value = string.IsNullOrWhiteSpace(first.TITULO_REPORTE)
					? "Partida Contable"
					: first.TITULO_REPORTE;
				Parameters["USUARIO_DIGITA"].Value = first.USUARIO_CREA ?? string.Empty;
			}

			DataSource = data;
		}

		private void ConfigureParameters()
		{
			AddHiddenParam("NOMBRE_EMPRESA", typeof(string), string.Empty);
			AddHiddenParam("TITULO_REPORTE", typeof(string), "Partida Contable");
			AddHiddenParam("USUARIO_DIGITA", typeof(string), string.Empty);
		}

		private void AddHiddenParam(string name, Type type, object defaultValue)
		{
			Parameters.Add(new global::DevExpress.XtraReports.Parameters.Parameter
			{
				Name = name,
				Type = type,
				Value = defaultValue,
				Visible = false,
			});
		}
	}
}
