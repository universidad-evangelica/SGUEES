using System;
using System.Data;
using CrystalDecisions.CrystalReports.Engine;

namespace sgueesRpt.Layouts
{
	/// <summary>
	/// Enlace push e-Admin: report.SetDataSource(DataSet) sin ApplyLogOnInfo ni mutar Table.Location.
	/// </summary>
	internal static class CrystalReportBinder
	{
		public static void ApplyPushDataSet(ReportDocument report, DataSet dataSet)
		{
			if (report == null || dataSet == null)
			{
				return;
			}

			report.SetDataSource(dataSet);

			foreach (ReportDocument subReport in report.Subreports)
			{
				ApplyPushDataSet(subReport, dataSet);
			}
		}

		public static void ApplyPushDataTable(ReportDocument report, DataTable data)
		{
			if (report == null || data == null)
			{
				return;
			}

			if (report.Database.Tables.Count > 0
				&& (string.IsNullOrWhiteSpace(data.TableName) || data.TableName == "Table"))
			{
				var reportTable = report.Database.Tables[0];
				var targetName = GetShortTableName(
					reportTable.LogOnInfo?.TableName ?? reportTable.Name ?? reportTable.Location);
				if (!string.IsNullOrWhiteSpace(targetName))
				{
					data.TableName = targetName;
				}
			}

			var dataSet = new DataSet();
			dataSet.Tables.Add(data);
			ApplyPushDataSet(report, dataSet);
		}

		private static string GetShortTableName(string value)
		{
			if (string.IsNullOrWhiteSpace(value))
			{
				return value;
			}

			var name = value.Trim();
			var dot = name.LastIndexOf('.');
			return dot >= 0 ? name.Substring(dot + 1) : name;
		}
	}
}
