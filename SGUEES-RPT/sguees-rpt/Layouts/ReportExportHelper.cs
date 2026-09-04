using System;
using System.Collections.Generic;

using System.Data;

using System.IO;

using System.Linq;

using System.Net.Http;

using System.Web.Http;

using CrystalDecisions.CrystalReports.Engine;

using CrystalDecisions.Shared;

using Newtonsoft.Json.Linq;

using sgueesRpt.Controllers;

using sgueesRpt.Models;

using sgueesRpt.Reports;



namespace sgueesRpt.Layouts

{

	public static class ReportExportHelper

	{

		public static DataTable CreateDataTableFromRows(IEnumerable<IDictionary<string, object>> rows)

		{

			var table = new DataTable();

			if (rows == null)

			{

				return table;

			}



			var rowList = rows.ToList();

			if (rowList.Count == 0)

			{

				return table;

			}

			var columnNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
			foreach (var row in rowList)
			{
				foreach (var key in row.Keys)
				{
					columnNames.Add(key);
				}
			}

			var columnTypes = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase);
			foreach (var columnName in columnNames)
			{
				var columnType = typeof(string);
				foreach (var row in rowList)
				{
					if (TryGetValue(row, columnName, out var rawValue))
					{
						var value = NormalizeValue(rawValue);
						if (value != null && value != DBNull.Value)
						{
							columnType = InferColumnType(value);
							break;
						}
					}
				}

				columnTypes[columnName] = columnType;
				table.Columns.Add(columnName, columnType);
			}

			foreach (var row in rowList)

			{

				var values = new object[table.Columns.Count];

				for (var i = 0; i < table.Columns.Count; i++)

				{

					var columnName = table.Columns[i].ColumnName;
					var columnType = table.Columns[i].DataType;

					if (TryGetValue(row, columnName, out var rawValue))
					{
						values[i] = ConvertCellValue(NormalizeValue(rawValue), columnType);
					}
					else
					{
						values[i] = DBNull.Value;
					}

				}



				table.Rows.Add(values);

			}



			return table;

		}

		private static bool TryGetValue(IDictionary<string, object> row, string key, out object value)
		{
			value = null;
			if (row == null)
			{
				return false;
			}

			if (row.TryGetValue(key, out value))
			{
				return true;
			}

			foreach (var item in row)
			{
				if (string.Equals(item.Key, key, StringComparison.OrdinalIgnoreCase))
				{
					value = item.Value;
					return true;
				}
			}

			return false;
		}

		private static object NormalizeValue(object value)
		{
			if (value == null || value == DBNull.Value)
			{
				return DBNull.Value;
			}

			if (value is JValue jValue)
			{
				return jValue.Value ?? (object)DBNull.Value;
			}

			if (value is JToken jToken && jToken.Type == JTokenType.Null)
			{
				return DBNull.Value;
			}

			return value;
		}

		private static Type InferColumnType(object value)
		{
			if (value is bool)
			{
				return typeof(bool);
			}

			if (value is byte[])
			{
				return typeof(byte[]);
			}

			if (value is DateTime)
			{
				return typeof(DateTime);
			}

			if (value is decimal)
			{
				return typeof(decimal);
			}

			if (value is double || value is float)
			{
				return typeof(decimal);
			}

			if (value is long || value is int || value is short || value is byte)
			{
				return typeof(int);
			}

			return typeof(string);
		}

		private static object ConvertCellValue(object value, Type columnType)
		{
			if (value == null || value == DBNull.Value)
			{
				return DBNull.Value;
			}

			var targetType = Nullable.GetUnderlyingType(columnType) ?? columnType;
			if (targetType.IsInstanceOfType(value))
			{
				return value;
			}

			if (targetType == typeof(bool))
			{
				if (value is string text)
				{
					if (bool.TryParse(text, out var parsedBool))
					{
						return parsedBool;
					}

					if (text == "1" || text == "0")
					{
						return text == "1";
					}
				}

				return Convert.ToBoolean(value);
			}

			if (targetType == typeof(int))
			{
				return Convert.ToInt32(value);
			}

			if (targetType == typeof(decimal))
			{
				return Convert.ToDecimal(value);
			}

			if (targetType == typeof(DateTime))
			{
				return Convert.ToDateTime(value);
			}

			return Convert.ChangeType(value, targetType);
		}



		public static IHttpActionResult ExportPdf<TReport, TData>(

			List<TData> data,

			HttpRequestMessage request,

			string pdfFileName,

			System.Action<TReport> configure = null)

			where TReport : ReportClass, new()

		{

			var report = new TReport();

			configure?.Invoke(report);

			CrystalReportBinder.ApplyPushDataTable(report, Utils.CreateDataTable(data));

			Stream stream = report.ExportToStream(ExportFormatType.PortableDocFormat);

			return new eDocResult(stream, request, pdfFileName);

		}

		public static IHttpActionResult ExportPdfDataSet<TReport>(
			DataSet data,
			HttpRequestMessage request,
			string pdfFileName)
			where TReport : ReportClass, new()
		{
			var report = new TReport();
			CrystalReportBinder.ApplyPushDataSet(report, data);
			Stream stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
			return new eDocResult(stream, request, pdfFileName);
		}

		/// <summary>
		/// Push legacy e-Admin: tabla detalle embebida en .rpt + GEN_PARAMETRO.
		/// Usar mientras el .rpt no se migre a una sola tabla *_IMPRView en Crystal Designer.
		/// </summary>
		public static IHttpActionResult ExportPdfLegacy<TReport, TData>(
			List<TData> data,
			HttpRequestMessage request,
			string pdfFileName,
			string detailTableName,
			string defaultTitle = null)
			where TReport : ReportClass, new()
		{
			return ExportPdfDataSet<TReport>(
				LegacyReportData.CreateDataSet(data, detailTableName, defaultTitle),
				request,
				pdfFileName);
		}

		public static IHttpActionResult ExportPdfDataSet(
			ReportDocument report,
			DataSet data,
			HttpRequestMessage request,
			string pdfFileName)
		{
			CrystalReportBinder.ApplyPushDataSet(report, data);
			Stream stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
			return new eDocResult(stream, request, pdfFileName);
		}



		public static IHttpActionResult ExportPdfFromFile<TData>(

			string modulo,

			string rptName,

			List<TData> data,

			HttpRequestMessage request,

			string pdfFileName)

		{

			var report = new ReportDocument();

			report.Load(Utils.getRuta(modulo, rptName));

			CrystalReportBinder.ApplyPushDataTable(report, Utils.CreateDataTable(data));

			Stream stream = report.ExportToStream(ExportFormatType.PortableDocFormat);

			return new eDocResult(stream, request, pdfFileName);

		}



		public static IHttpActionResult ExportPdfFromFile(

			string modulo,

			string rptName,

			List<Dictionary<string, object>> data,

			HttpRequestMessage request,

			string pdfFileName)

		{

			var report = new ReportDocument();

			report.Load(Utils.getRuta(modulo, rptName));

			CrystalReportBinder.ApplyPushDataTable(report, CreateDataTableFromRows(data));

			Stream stream = report.ExportToStream(ExportFormatType.PortableDocFormat);

			return new eDocResult(stream, request, pdfFileName);

		}

		public static IHttpActionResult ExportPdfFromFileDataSet(
			string modulo,
			string rptName,
			DataSet data,
			HttpRequestMessage request,
			string pdfFileName)
		{
			var report = new ReportDocument();
			report.Load(Utils.getRuta(modulo, rptName));
			CrystalReportBinder.ApplyPushDataSet(report, data);
			Stream stream = report.ExportToStream(ExportFormatType.PortableDocFormat);
			return new eDocResult(stream, request, pdfFileName);
		}

	}

}


