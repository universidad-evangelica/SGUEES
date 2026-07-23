using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using sgueesRpt.Layouts;
using sgueesRpt.Models;

using sgueesRpt.Reports.Accounting.CON_GASTOS;

namespace sgueesRpt.Reports.Accounting
{
	/// <summary>
	/// Arma el DataSet e-Admin (tabla detalle del SP + GEN_PARAMETRO) para reportes contables.
	/// </summary>
	internal static class ConReportData
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

		public static DataSet CreateDataSet<T>(List<T> rows, string detailTableName)
		{
			var firstRow = rows != null && rows.Count > 0 ? rows[0] : default(T);
			return CreateDataSetInternal(
				Utils.CreateDataTable(rows ?? new List<T>()),
				ToHeaderDictionary(firstRow),
				detailTableName);
		}

		public static DataSet CreateDataSet(List<CON_GASTOS_IMPRView> rows, string detailTableName)
		{
			return CreateDataSet<CON_GASTOS_IMPRView>(rows, detailTableName);
		}

		private static DataSet CreateDataSetInternal(
			DataTable detail,
			Dictionary<string, object> header,
			string detailTableName)
		{
			detail.TableName = string.IsNullOrWhiteSpace(detailTableName)
				? "Table"
				: detailTableName.Trim();

			foreach (var columnName in HeaderColumns)
			{
				if (detail.Columns.Contains(columnName))
				{
					detail.Columns.Remove(columnName);
				}
			}

			EnsureReportColumns(detail, header);

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
					GetInt(header, "CORR_EMPRESA"),
					GetString(header, "NOMBRE_EMPRESA"),
					GetString(header, "PERIODO"),
					GetBytes(header, "LOGO1"),
					GetBytes(header, "LOGO2"),
					GetString(header, "TITULO_REPORTE"),
					GetString(header, "NOMBRE_SISTEMA"),
					GetDateTime(header, "FECHA_IMPRESION"));
			}
			else
			{
				param.Rows.Add(0, string.Empty, string.Empty, DBNull.Value, DBNull.Value, string.Empty, "SGUEES", DateTime.Now);
			}

			var dataSet = new DataSet();
			dataSet.Tables.Add(detail);
			dataSet.Tables.Add(param);
			return dataSet;
		}

		private static Dictionary<string, object> ToHeaderDictionary(object row)
		{
			if (row == null)
			{
				return null;
			}

			var header = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
			foreach (var property in row.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance))
			{
				if (!property.CanRead)
				{
					continue;
				}

				header[property.Name] = property.GetValue(row, null);
			}

			return header;
		}

		private static void EnsureReportColumns(DataTable detail, Dictionary<string, object> header)
		{
			EnsureColumn(detail, "NIVEL_CUENTA_MAYOR", typeof(int), GetPositiveInt(header, "NIVEL_CUENTA_MAYOR", 1));
			EnsureColumn(detail, "NIVEL", typeof(int), GetInt(header, "NIVEL"));
			EnsureColumn(detail, "CODIGO_RUBRO", typeof(string), GetString(header, "CODIGO_RUBRO"));
			EnsureColumn(detail, "FOLIADO", typeof(bool), GetBool(header, "FOLIADO", false));
			EnsureColumn(detail, "NUMERO_FOLIO", typeof(int), GetInt(header, "NUMERO_FOLIO"));
			EnsureColumn(detail, "CUENTA_A_CERO", typeof(bool), GetBool(header, "CUENTA_A_CERO", false));
			EnsureColumn(detail, "CONSOLIDADO", typeof(bool), GetBool(header, "CONSOLIDADO", false));
			EnsureColumn(detail, "MUESTRA_FIRMA", typeof(bool), GetBool(header, "MUESTRA_FIRMA", false));
			EnsureColumn(detail, "MOSTRAR_FECHA_IMPRESION", typeof(bool), GetBool(header, "MOSTRAR_FECHA_IMPRESION", false));
			EnsureColumn(detail, "CLASE_RUBRO", typeof(string), GetString(header, "CLASE_RUBRO"));
			EnsureColumn(detail, "CUENTA_DEPARTAMENTO", typeof(string), GetString(header, "CUENTA_DEPARTAMENTO"));
			EnsureColumn(detail, "DESCRIPCION_MONEDA", typeof(string), GetString(header, "DESCRIPCION_MONEDA"));
			EnsureColumn(detail, "NOMBRE_MONEDA", typeof(string), GetString(header, "NOMBRE_MONEDA"));
			EnsureColumn(detail, "SIMBOLO_MONEDA", typeof(string), GetString(header, "SIMBOLO_MONEDA"));
		}

		private static void EnsureColumn(DataTable detail, string columnName, Type columnType, object defaultValue)
		{
			if (!detail.Columns.Contains(columnName))
			{
				detail.Columns.Add(columnName, columnType);
				foreach (DataRow row in detail.Rows)
				{
					row[columnName] = defaultValue ?? DBNull.Value;
				}

				return;
			}

			if (detail.Columns[columnName].DataType != columnType)
			{
				var currentName = detail.Columns[columnName].ColumnName;
				var replacement = new DataColumn(columnName + "_typed", columnType);
				detail.Columns.Add(replacement);

				foreach (DataRow row in detail.Rows)
				{
					var rawValue = row[currentName];
					row[replacement] = rawValue == null || rawValue == DBNull.Value
						? defaultValue ?? DBNull.Value
						: Convert.ChangeType(rawValue, columnType);
				}

				var ordinal = detail.Columns[currentName].Ordinal;
				detail.Columns.Remove(currentName);
				replacement.ColumnName = columnName;
				replacement.SetOrdinal(ordinal);
			}
		}

		private static bool GetBool(Dictionary<string, object> row, string key, bool defaultValue)
		{
			var value = GetValue(row, key);
			if (value == null || value == DBNull.Value)
			{
				return defaultValue;
			}

			if (value is bool boolValue)
			{
				return boolValue;
			}

			if (bool.TryParse(Convert.ToString(value), out var parsed))
			{
				return parsed;
			}

			return Convert.ToInt32(value) != 0;
		}

		private static object GetValue(Dictionary<string, object> row, string key)
		{
			if (row == null)
			{
				return null;
			}

			foreach (var item in row)
			{
				if (string.Equals(item.Key, key, StringComparison.OrdinalIgnoreCase))
				{
					return item.Value;
				}
			}

			return null;
		}

		private static int GetInt(Dictionary<string, object> row, string key)
		{
			var value = GetValue(row, key);
			if (value == null || value == DBNull.Value)
			{
				return 0;
			}

			return Convert.ToInt32(value);
		}

		private static int GetPositiveInt(Dictionary<string, object> row, string key, int defaultValue)
		{
			var value = GetInt(row, key);
			return value > 0 ? value : defaultValue;
		}

		private static string GetString(Dictionary<string, object> row, string key)
		{
			var value = GetValue(row, key);
			return value == null || value == DBNull.Value ? string.Empty : Convert.ToString(value);
		}

		private static object GetBytes(Dictionary<string, object> row, string key)
		{
			var value = GetValue(row, key);
			return value == null || value == DBNull.Value ? (object)DBNull.Value : value;
		}

		private static object GetDateTime(Dictionary<string, object> row, string key)
		{
			var value = GetValue(row, key);
			if (value == null || value == DBNull.Value)
			{
				return DateTime.Now;
			}

			return Convert.ToDateTime(value);
		}
	}
}
