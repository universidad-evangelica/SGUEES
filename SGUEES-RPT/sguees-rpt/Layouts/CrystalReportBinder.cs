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

			// Qué hace: empuja el DataSet al informe principal.
			// Cómo: Crystal distribuye automáticamente los datos a los subinformes
			// por coincidencia de nombre de tabla; no es necesario iterar Subreports.
			report.SetDataSource(dataSet);
		}

		public static void ApplyPushDataTable(ReportDocument report, DataTable data)
		{
			if (report == null || data == null)
			{
				return;
			}

			var reportTable = GetMainReportTable(report);
			if (reportTable != null
				&& (string.IsNullOrWhiteSpace(data.TableName) || data.TableName == "Table"))
			{
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

		private static Table GetMainReportTable(ReportDocument report)
		{
			if (report?.Database?.Tables == null || report.Database.Tables.Count == 0)
			{
				return null;
			}

			if (report.Database.Tables.Count == 1)
			{
				return report.Database.Tables[0];
			}

			Table fallback = null;
			foreach (Table table in report.Database.Tables)
			{
				var shortName = GetShortTableName(table.Name ?? table.Location);
				if (string.Equals(shortName, "GEN_PARAMETRO", StringComparison.OrdinalIgnoreCase))
				{
					continue;
				}

				if (shortName != null && shortName.EndsWith("_IMPRView", StringComparison.OrdinalIgnoreCase))
				{
					return table;
				}

				fallback = table;
			}

			return fallback ?? report.Database.Tables[0];
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
