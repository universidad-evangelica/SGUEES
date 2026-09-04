using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using sgueesRpt.Models;

namespace sgueesRpt.Reports
{
	/// <summary>
	/// Arma DataSet legacy e-Admin: tabla detalle + GEN_PARAMETRO (encabezado).
	/// Los .rpt de Contabilidad/Bancos aun tienen ambas tablas en el explorador Crystal.
	/// </summary>
	internal static class LegacyReportData
	{
		private static readonly string[] HeaderColumns =
		{
			"CORR_EMPRESA",
			"NOMBRE_EMPRESA",
			"PERIODO",
			"LOGO1",
			"LOGO2",
			"TITULO_REPORTE",
			"NOMBRE_SISTEMA",
			"FECHA_IMPRESION",
		};

		public static DataSet CreateDataSet<T>(List<T> rows, string detailTableName, string defaultTitle = null)
		{
			var source = rows ?? new List<T>();
			var detail = Utils.CreateDataTable(source);
			detail.TableName = string.IsNullOrWhiteSpace(detailTableName) ? "Table" : detailTableName.Trim();

			RemoveHeaderColumns(detail);

			var header = source.FirstOrDefault();
			var param = CreateHeaderTable(header, defaultTitle);

			var dataSet = new DataSet();
			dataSet.Tables.Add(detail);
			dataSet.Tables.Add(param);
			return dataSet;
		}

		private static void RemoveHeaderColumns(DataTable detail)
		{
			foreach (var columnName in HeaderColumns)
			{
				if (detail.Columns.Contains(columnName))
				{
					detail.Columns.Remove(columnName);
				}
			}
		}

		private static DataTable CreateHeaderTable<T>(T header, string defaultTitle)
		{
			var param = new DataTable("GEN_PARAMETRO");
			param.Columns.Add("CORR_EMPRESA", typeof(int));
			param.Columns.Add("NOMBRE_EMPRESA", typeof(string));
			param.Columns.Add("PERIODO", typeof(string));
			param.Columns.Add("LOGO1", typeof(byte[]));
			param.Columns.Add("LOGO2", typeof(byte[]));
			param.Columns.Add("TITULO_REPORTE", typeof(string));
			param.Columns.Add("NOMBRE_SISTEMA", typeof(string));
			param.Columns.Add("FECHA_IMPRESION", typeof(DateTime));

			if (header == null)
			{
				return param;
			}

			param.Rows.Add(
				GetValue<int>(header, "CORR_EMPRESA"),
				GetValue<string>(header, "NOMBRE_EMPRESA") ?? string.Empty,
				GetValue<string>(header, "PERIODO") ?? string.Empty,
				GetValue<byte[]>(header, "LOGO1") ?? (object)DBNull.Value,
				GetValue<byte[]>(header, "LOGO2") ?? (object)DBNull.Value,
				ResolveTitle(header, defaultTitle),
				GetValue<string>(header, "NOMBRE_SISTEMA") ?? string.Empty,
				ResolvePrintDate(header));

			return param;
		}

		private static string ResolveTitle<T>(T header, string defaultTitle)
		{
			var title = GetValue<string>(header, "TITULO_REPORTE");
			if (!string.IsNullOrWhiteSpace(title))
			{
				return title;
			}

			return string.IsNullOrWhiteSpace(defaultTitle) ? string.Empty : defaultTitle;
		}

		private static DateTime ResolvePrintDate<T>(T header)
		{
			var value = GetValue<DateTime>(header, "FECHA_IMPRESION");
			return value == default(DateTime) ? DateTime.Now : value;
		}

		private static TValue GetValue<TValue>(object source, string propertyName)
		{
			if (source == null)
			{
				return default(TValue);
			}

			var property = source.GetType().GetProperty(propertyName);
			if (property == null)
			{
				return default(TValue);
			}

			var value = property.GetValue(source, null);
			if (value == null || value == DBNull.Value)
			{
				return default(TValue);
			}

			if (value is TValue)
			{
				return (TValue)value;
			}

			return (TValue)Convert.ChangeType(value, typeof(TValue));
		}
	}
}
