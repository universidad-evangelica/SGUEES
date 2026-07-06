using System;
using System.Data;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;

namespace sgueesRpt.Layouts
{
	internal static class CrystalReportBinder
	{
		public static void ApplyPushDataSet(ReportDocument report, DataSet dataSet)
		{
			if (report == null || dataSet == null)
			{
				return;
			}

			report.SetDataSource(dataSet);
			BindTables(report, dataSet);
			BindSubreports(report, dataSet);
			ClearDatabaseLogon(report);
		}

		private static void BindTables(ReportDocument report, DataSet dataSet)
		{
			foreach (Table table in report.Database.Tables)
			{
				var source = FindTable(dataSet, table.Name, table.LogOnInfo?.TableName);
				if (source != null)
				{
					table.SetDataSource(source);
					table.Location = source.TableName;
				}
			}
		}

		private static void BindSubreports(ReportDocument report, DataSet dataSet)
		{
			foreach (ReportDocument subReport in report.Subreports)
			{
				ApplyPushDataSet(subReport, dataSet);
			}
		}

		private static DataTable FindTable(DataSet dataSet, params string[] candidates)
		{
			if (dataSet == null || candidates == null)
			{
				return null;
			}

			foreach (var candidate in candidates)
			{
				if (string.IsNullOrWhiteSpace(candidate))
				{
					continue;
				}

				if (dataSet.Tables.Contains(candidate))
				{
					return dataSet.Tables[candidate];
				}

				foreach (DataTable table in dataSet.Tables)
				{
					if (string.Equals(table.TableName, candidate, StringComparison.OrdinalIgnoreCase))
					{
						return table;
					}
				}

				var shortName = GetShortTableName(candidate);
				if (!string.IsNullOrWhiteSpace(shortName))
				{
					foreach (DataTable table in dataSet.Tables)
					{
						if (string.Equals(table.TableName, shortName, StringComparison.OrdinalIgnoreCase)
							|| string.Equals(GetShortTableName(table.TableName), shortName, StringComparison.OrdinalIgnoreCase))
						{
							return table;
						}
					}
				}
			}

			return null;
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

		private static void ClearDatabaseLogon(ReportDocument report)
		{
			try
			{
				report.SetDatabaseLogon(string.Empty, string.Empty);
			}
			catch
			{
				// Algunas versiones de Crystal no requieren este paso cuando el push data source ya fue aplicado.
			}

			foreach (Table table in report.Database.Tables)
			{
				ClearTableLogonInfo(table);
			}
		}

		private static void ClearTableLogonInfo(Table table)
		{
			try
			{
				var logonInfo = table.LogOnInfo;
				if (logonInfo?.ConnectionInfo == null)
				{
					return;
				}

				logonInfo.ConnectionInfo.ServerName = string.Empty;
				logonInfo.ConnectionInfo.DatabaseName = string.Empty;
				logonInfo.ConnectionInfo.UserID = string.Empty;
				logonInfo.ConnectionInfo.Password = string.Empty;
				table.ApplyLogOnInfo(logonInfo);
			}
			catch
			{
				// Ignorar tablas ya enlazadas por push data source.
			}
		}
	}
}
