using System.Collections.Generic;

using System.Data;

using System.IO;

using System.Linq;

using System.Net.Http;

using System.Web.Http;

using CrystalDecisions.CrystalReports.Engine;

using CrystalDecisions.Shared;

using sgueesRpt.Controllers;

using sgueesRpt.Models;



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



			foreach (var key in rowList[0].Keys)

			{

				table.Columns.Add(key);

			}



			foreach (var row in rowList)

			{

				var values = new object[table.Columns.Count];

				for (var i = 0; i < table.Columns.Count; i++)

				{

					var columnName = table.Columns[i].ColumnName;

					values[i] = row.ContainsKey(columnName) && row[columnName] != null

						? row[columnName]

						: (object)System.DBNull.Value;

				}



				table.Rows.Add(values);

			}



			return table;

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

			report.SetDataSource(Utils.CreateDataTable(data));

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
			report.SetDataSource(data);
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

			report.SetDataSource(Utils.CreateDataTable(data));

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

			report.SetDataSource(CreateDataTableFromRows(data));

			Stream stream = report.ExportToStream(ExportFormatType.PortableDocFormat);

			return new eDocResult(stream, request, pdfFileName);

		}

	}

}


