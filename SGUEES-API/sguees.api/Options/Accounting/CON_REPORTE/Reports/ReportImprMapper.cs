using System;
using System.Collections.Generic;
using System.Reflection;
using sguees.Models;

namespace sguees.Repositories
{
	internal static class ReportImprMapper
	{
		public static List<TView> ToImprViews<TView>(List<Dictionary<string, object>> rows)
			where TView : new()
		{
			var views = new List<TView>();
			if (rows == null)
			{
				return views;
			}

			foreach (var row in rows)
			{
				views.Add(MapToView<TView>(row));
			}

			return views;
		}

		public static TView MapToView<TView>(Dictionary<string, object> row)
			where TView : new()
		{
			var view = new TView();
			if (row == null)
			{
				return view;
			}

			foreach (var property in typeof(TView).GetProperties(BindingFlags.Public | BindingFlags.Instance))
			{
				if (!property.CanWrite || !TryGetRowValue(row, property.Name, out var rawValue))
				{
					continue;
				}

				if (rawValue == null || rawValue == DBNull.Value)
				{
					continue;
				}

				try
				{
					var targetType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
					if (targetType == typeof(bool) && rawValue is not bool)
					{
						property.SetValue(view, Convert.ToInt32(rawValue) != 0);
					}
					else if (targetType == typeof(byte[]) && rawValue is byte[] bytes)
					{
						property.SetValue(view, bytes);
					}
					else
					{
						property.SetValue(view, Convert.ChangeType(rawValue, targetType));
					}
				}
				catch
				{
					// Columna opcional o tipo incompatible con la vista del reporte.
				}
			}

			return view;
		}

		private static bool TryGetRowValue(Dictionary<string, object> row, string key, out object value)
		{
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

			value = null;
			return false;
		}
	}
}
