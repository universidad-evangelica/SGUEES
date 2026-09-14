using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Configuration;
using DevExpress.XtraReports.UI;

namespace sgueesRpt.Reports.SelectionHiring.SC_REQUISICION_PERSONAL
{
	/// <summary>
	/// Requisición de personal — XtraReport (Designer en rptRequisicionPersonal.Designer.cs).
	/// </summary>
	public partial class rptRequisicionPersonal : XtraReport
	{
		public rptRequisicionPersonal()
		{
			InitializeComponent();
		}

		public void LoadFromDatabase(int corrEmpresa, int corrRequisicionPersonal)
		{
			var cs = ConfigurationManager.ConnectionStrings["SgueesDb"];
			if (cs == null || string.IsNullOrWhiteSpace(cs.ConnectionString))
			{
				throw new InvalidOperationException(
					"Falta ConnectionString 'SgueesDb' en Web.config. Configure Data Source, Initial Catalog, User Id y Password.");
			}

			var table = new DataTable();
			using (var cn = new SqlConnection(cs.ConnectionString))
			using (var cmd = new SqlCommand("dbo.PRAL_IMPR_SC_REQUISICION_PERSONAL", cn))
			{
				cmd.CommandType = CommandType.StoredProcedure;
				cmd.Parameters.Add("@CORR_EMPRESA", SqlDbType.Int).Value = corrEmpresa;
				cmd.Parameters.Add("@CORR_REQUISICION_PERSONAL", SqlDbType.Int).Value = corrRequisicionPersonal;
				cn.Open();
				using (var reader = cmd.ExecuteReader())
				{
					table.Load(reader);
				}
			}

			if (table.Rows.Count == 0)
			{
				throw new InvalidOperationException(
					$"No hay datos para CORR_EMPRESA={corrEmpresa}, CORR_REQUISICION_PERSONAL={corrRequisicionPersonal}.");
			}

			DataSource = table;
			ApplyCheckMarks(table.Rows[0]);
		}

		private void ApplyCheckMarks(DataRow row)
		{
			SetCheck(lblChkPresencial, row, "CHK_PRESENCIAL");
			SetCheck(lblChkTeleTotal, row, "CHK_TELETRABAJO_TOTAL");
			SetCheck(lblChkTeleParcial, row, "CHK_TELETRABAJO_PARCIAL");
			SetCheck(lblChkPermanente, row, "CHK_PERMANENTE");
			SetCheck(lblChkTemporal, row, "CHK_TEMPORAL");
			SetCheck(lblChkPromocion, row, "CHK_PROMOCION");
			SetCheck(lblChkTransferencia, row, "CHK_TRANSFERENCIA");
			SetCheck(lblChkRenuncia, row, "CHK_RENUNCIA");
			SetCheck(lblChkNuevaCreacion, row, "CHK_NUEVA_CREACION");
			SetCheck(lblChkOtros, row, "CHK_OTROS");
		}

		private static void SetCheck(XRLabel label, DataRow row, string column)
		{
			var on = false;
			if (row.Table.Columns.Contains(column) && row[column] != DBNull.Value)
			{
				on = Convert.ToBoolean(row[column]);
			}
			label.Text = on ? "X" : " ";
		}
	}
}
