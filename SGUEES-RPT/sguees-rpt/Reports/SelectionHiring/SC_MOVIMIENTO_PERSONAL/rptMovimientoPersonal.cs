using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using DevExpress.XtraReports.UI;

namespace sgueesRpt.Reports.SelectionHiring.SC_MOVIMIENTO_PERSONAL
{
	/// <summary>
	/// Movimiento de personal — XtraReport.
	/// LoadFromDatabase deja en DataSource todas las columnas de la fila
	/// (PRAL_IMPR_SC_MOVIMIENTO_PERSONAL). Los campos sin control en el layout
	/// se enlazan manualmente en el diseñador.
	/// </summary>
	public partial class rptMovimientoPersonal : XtraReport
	{
		public rptMovimientoPersonal()
		{
			InitializeComponent();
		}

		public void LoadFromDatabase(int corrEmpresa, int corrMovimientoPersonal)
		{
			var cs = ConfigurationManager.ConnectionStrings["SgueesDb"];
			if (cs == null || string.IsNullOrWhiteSpace(cs.ConnectionString))
			{
				throw new InvalidOperationException(
					"Falta ConnectionString 'SgueesDb' en Web.config. Configure Data Source, Initial Catalog, User Id y Password.");
			}

			var table = new DataTable();
			using (var cn = new SqlConnection(cs.ConnectionString))
			using (var cmd = new SqlCommand("dbo.PRAL_IMPR_SC_MOVIMIENTO_PERSONAL", cn))
			{
				cmd.CommandType = CommandType.StoredProcedure;
				cmd.Parameters.Add("@CORR_EMPRESA", SqlDbType.Int).Value = corrEmpresa;
				cmd.Parameters.Add("@CORR_MOVIMIENTO_PERSONAL", SqlDbType.Int).Value = corrMovimientoPersonal;
				cn.Open();
				using (var reader = cmd.ExecuteReader())
				{
					table.Load(reader);
				}
			}

			if (table.Rows.Count == 0)
			{
				throw new InvalidOperationException(
					$"No hay datos para CORR_EMPRESA={corrEmpresa}, CORR_MOVIMIENTO_PERSONAL={corrMovimientoPersonal}.");
			}

			DataSource = table;
			ApplyTipoMovimiento(table.Rows[0]);
		}

		/// <summary>
		/// Marca la casilla según TIPO_MOVIMIENTO (PERMANENTE | EVENTUAL | ASCENSO | TRASLADO).
		/// Si enlazas esas etiquetas en el diseñador, la expresión del diseñador prevalece al imprimir.
		/// </summary>
		private void ApplyTipoMovimiento(DataRow row)
		{
			var tipo = string.Empty;
			if (row.Table.Columns.Contains("TIPO_MOVIMIENTO") && row["TIPO_MOVIMIENTO"] != DBNull.Value)
			{
				tipo = Convert.ToString(row["TIPO_MOVIMIENTO"]) ?? string.Empty;
			}

			SetMark(lblChkPermanente, tipo.Equals("PERMANENTE", StringComparison.OrdinalIgnoreCase));
			SetMark(lblChkEventual, tipo.Equals("EVENTUAL", StringComparison.OrdinalIgnoreCase));
			SetMark(lblChkAscenso, tipo.Equals("ASCENSO", StringComparison.OrdinalIgnoreCase));
			SetMark(lblChkTraslado, tipo.Equals("TRASLADO", StringComparison.OrdinalIgnoreCase));
		}

		private static void SetMark(XRLabel label, bool on)
		{
			if (label == null)
			{
				return;
			}
			label.Text = on ? "X" : " ";
		}
	}
}
