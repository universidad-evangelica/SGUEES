using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using sgueesRpt.Models;

namespace sgueesRpt.Reports.Accounting.CON_PARTIDA
{
	internal static class ConPartidaReportData
	{
		private static readonly string[] HeaderColumns =
		{
			"NOMBRE_EMPRESA",
			"PERIODO",
			"LOGO1",
			"LOGO2",
			"TITULO_REPORTE",
			"NOMBRE_SISTEMA",
			"FECHA_IMPRESION",
		};

		public static DataSet CreateDataSet(List<CON_PARTIDA_IMPRView> data)
		{
			var rows = data ?? new List<CON_PARTIDA_IMPRView>();
			var detail = Utils.CreateDataTable(rows);
			detail.TableName = "V_CON_PARTIDA_IMPR";

			foreach (var columnName in HeaderColumns)
			{
				if (detail.Columns.Contains(columnName))
				{
					detail.Columns.Remove(columnName);
				}
			}

			var header = rows.FirstOrDefault();
			var param = new DataTable("GEN_PARAMETRO");
			param.Columns.Add("CORR_EMPRESA", typeof(int));
			param.Columns.Add("NOMBRE_EMPRESA", typeof(string));
			param.Columns.Add("PERIODO", typeof(string));
			param.Columns.Add("LOGO1", typeof(byte[]));
			param.Columns.Add("LOGO2", typeof(byte[]));
			param.Columns.Add("TITULO_REPORTE", typeof(string));
			param.Columns.Add("NOMBRE_SISTEMA", typeof(string));
			param.Columns.Add("FECHA_IMPRESION", typeof(DateTime));

			if (header != null)
			{
				param.Rows.Add(
					header.CORR_EMPRESA,
					header.NOMBRE_EMPRESA ?? string.Empty,
					header.PERIODO ?? string.Empty,
					header.LOGO1 ?? (object)DBNull.Value,
					header.LOGO2 ?? (object)DBNull.Value,
					string.IsNullOrWhiteSpace(header.TITULO_REPORTE) ? "Partida Contable" : header.TITULO_REPORTE,
					header.NOMBRE_SISTEMA ?? string.Empty,
					header.FECHA_IMPRESION == default(DateTime) ? DateTime.Now : header.FECHA_IMPRESION);
			}

			var dataSet = new DataSet();
			dataSet.Tables.Add(detail);
			dataSet.Tables.Add(param);
			return dataSet;
		}
	}
}
