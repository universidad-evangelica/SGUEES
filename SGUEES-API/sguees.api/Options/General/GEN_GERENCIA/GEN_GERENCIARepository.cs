using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_GERENCIARepository : BaseRepository<GEN_GERENCIATable>, IGEN_GERENCIARepository
	{
		private const string _TableName = "GEN_GERENCIA";
		private const string _ViewName = "V_GEN_GERENCIA";
		private const string _DefaultSortField = "CORR_GERENCIA";

		private static readonly string[] _AllowedSortFields =
		{
			"CORR_GERENCIA",
			"NOMBRE_GERENCIA",
			"CODIGO_GERENCIA",
			"NOMBRE_DIVISION",
			"CODIGO_DIVISION",
			"USUARIO_CREA",
			"ESTACION_CREA",
			"FECHA_CREA",
			"USUARIO_ACTU",
			"ESTACION_ACTU",
			"FECHA_ACTU",
		};

		public GEN_GERENCIARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var paged = await ReadPagedViewAsync<GEN_GERENCIAView>(
					_ViewName,
					xWhere,
					_AllowedSortFields,
					_DefaultSortField);

				objResultado.Data = paged.PageData;
				objResultado.Result = true;
				objResultado.RowsAffected = paged.TotalRows;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> GetDistinctValuesAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var distinctField = GetFilterValue(xWhere, "DISTINCT_FIELD")?.Trim();
				var search = GetFilterValue(xWhere, "HEADER_FILTER_SEARCH");

				if (string.IsNullOrWhiteSpace(distinctField) || !IsAllowedDistinctField(distinctField))
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "El campo solicitado no es valido para el filtro de encabezado.";
					objResultado.ErrorSource = "[GEN_GERENCIARepository]";
					return objResultado;
				}

				var response = await FilterQueryAsync(xWhere);
				var values = CollectDistinctValuesInRowOrder(response, distinctField, search);

				objResultado.Data = values;
				objResultado.Result = true;
				objResultado.RowsAffected = values.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private async Task<List<GEN_GERENCIAView>> FilterQueryAsync(List<CParameter> xWhere, string skipColumnFilter = null)
		{
			var dbWhere = xWhere
				.Where(x => x.ParameterName == "CORR_EMPRESA")
				.ToList();

			var busqueda = xWhere
				.Where(x => x.ParameterName == "BUSQUEDA")
				.Select(x => x.Value?.ToString())
				.FirstOrDefault();

			var filterRowFilters = GetJsonStringFilters(xWhere, "FILTER_ROW_JSON")
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToList();

			var exactColumnFilters = GetJsonStringFilters(xWhere, "COLUMN_EXACT_JSON")
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToList();

			var anyOfFilters = GetAnyOfFilters(xWhere)
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);

			var reader = await objData.GetDataReader("V_" + _TableName, dbWhere);
			var response = new List<GEN_GERENCIAView>().FromDataReader(reader).ToList();

			reader.Close();
			reader = null;

			if (!string.IsNullOrWhiteSpace(busqueda))
			{
				var search = busqueda.Trim();
				response = response
					.Where(x =>
						Contains(x.CORR_EMPRESA.ToString(), search) ||
						Contains(x.CORR_GERENCIA.ToString(), search) ||
						Contains(x.NOMBRE_GERENCIA, search) ||
						Contains(x.CODIGO_GERENCIA, search) ||
						Contains(x.CORR_DIVISION?.ToString(), search) ||
						Contains(x.NOMBRE_DIVISION, search) ||
						Contains(x.CODIGO_DIVISION, search) ||
						Contains(x.USUARIO_CREA, search) ||
						Contains(x.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm"), search) ||
						Contains(x.ESTACION_CREA, search) ||
						Contains(x.USUARIO_ACTU, search) ||
						Contains(x.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm"), search) ||
						Contains(x.ESTACION_ACTU, search))
					.ToList();
			}

			response = ApplyColumnFilters(response, filterRowFilters, exactColumnFilters, anyOfFilters);

			return ApplySort(response, xWhere);
		}

		private static List<GEN_GERENCIAView> ApplyColumnFilters(
			List<GEN_GERENCIAView> response,
			List<KeyValuePair<string, string>> filterRowFilters,
			List<KeyValuePair<string, string>> exactColumnFilters,
			Dictionary<string, List<string>> anyOfFilters)
		{
			var containsByField = filterRowFilters.ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);
			var exactByField = exactColumnFilters.ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);

			if (IsCrossColumnFilter(anyOfFilters, containsByField, exactByField))
			{
				return response
					.Where(x =>
						MatchesAnyOfFilters(x, anyOfFilters) &&
						MatchesFilterRowFilters(x, containsByField, exactByField))
					.ToList();
			}

			var allFields = containsByField.Keys
				.Concat(exactByField.Keys)
				.Concat(anyOfFilters.Keys)
				.Distinct(StringComparer.OrdinalIgnoreCase)
				.ToList();

			foreach (var field in allFields)
			{
				containsByField.TryGetValue(field, out var containsValue);
				exactByField.TryGetValue(field, out var exactValue);
				anyOfFilters.TryGetValue(field, out var anyOfValues);

				var hasContains = !string.IsNullOrWhiteSpace(containsValue);
				var hasExact = !string.IsNullOrWhiteSpace(exactValue);
				var hasAnyOf = anyOfValues?.Count > 0;
				var constraintCount = (hasContains ? 1 : 0) + (hasExact ? 1 : 0) + (hasAnyOf ? 1 : 0);

				if (constraintCount == 0)
				{
					continue;
				}

				if (constraintCount > 1)
				{
					response = response
						.Where(x =>
							(!hasAnyOf || anyOfValues.Any(value => MatchesAnyOfColumnValue(x, field, value))) &&
							(!hasExact || MatchesExactColumnValue(x, field, exactValue)) &&
							(!hasContains || Contains(GetColumnValue(x, field), containsValue)))
						.ToList();
					continue;
				}

				if (hasAnyOf)
				{
					response = response
						.Where(x => anyOfValues.Any(value => MatchesAnyOfColumnValue(x, field, value)))
						.ToList();
					continue;
				}

				if (hasExact)
				{
					response = response
						.Where(x => MatchesExactColumnValue(x, field, exactValue))
						.ToList();
					continue;
				}

				response = response
					.Where(x => Contains(GetColumnValue(x, field), containsValue))
					.ToList();
			}

			return response;
		}

		private static bool IsCrossColumnFilter(
			Dictionary<string, List<string>> anyOfFilters,
			Dictionary<string, string> containsByField,
			Dictionary<string, string> exactByField)
		{
			if (anyOfFilters.Count == 0)
			{
				return false;
			}

			var filterRowFields = containsByField.Keys
				.Concat(exactByField.Keys)
				.ToHashSet(StringComparer.OrdinalIgnoreCase);

			if (filterRowFields.Count == 0)
			{
				return false;
			}

			return !filterRowFields.Any(anyOfFilters.ContainsKey);
		}

		private static bool MatchesAnyOfFilters(
			GEN_GERENCIAView row,
			Dictionary<string, List<string>> anyOfFilters)
		{
			foreach (var filter in anyOfFilters)
			{
				if (filter.Value?.Any(value => MatchesAnyOfColumnValue(row, filter.Key, value)) != true)
				{
					return false;
				}
			}

			return anyOfFilters.Count > 0;
		}

		private static bool MatchesFilterRowFilters(
			GEN_GERENCIAView row,
			Dictionary<string, string> containsByField,
			Dictionary<string, string> exactByField)
		{
			foreach (var filter in containsByField)
			{
				if (!Contains(GetColumnValue(row, filter.Key), filter.Value))
				{
					return false;
				}
			}

			foreach (var filter in exactByField)
			{
				if (!MatchesExactColumnValue(row, filter.Key, filter.Value))
				{
					return false;
				}
			}

			return containsByField.Count + exactByField.Count > 0;
		}

		private static List<GEN_GERENCIAView> ApplySort(List<GEN_GERENCIAView> response, List<CParameter> xWhere)
		{
			var sortField = GetFilterValue(xWhere, "SORT_FIELD")?.Trim();
			var sortDescValue = xWhere
				.Where(x => x.ParameterName == "SORT_DESC")
				.Select(x => x.Value as bool?)
				.FirstOrDefault();

			if (string.IsNullOrWhiteSpace(sortField) || !IsAllowedDistinctField(sortField))
			{
				return response
					.OrderBy(x => x.CORR_EMPRESA)
					.ThenBy(x => x.CORR_GERENCIA)
					.ToList();
			}

			var desc = sortDescValue ?? false;
			IEnumerable<GEN_GERENCIAView> ordered = sortField switch
			{
				"CORR_GERENCIA" => desc
					? response.OrderByDescending(x => x.CORR_GERENCIA)
					: response.OrderBy(x => x.CORR_GERENCIA),
				"NOMBRE_GERENCIA" => desc
					? response.OrderByDescending(x => x.NOMBRE_GERENCIA)
					: response.OrderBy(x => x.NOMBRE_GERENCIA),
				"CODIGO_GERENCIA" => desc
					? response.OrderByDescending(x => x.CODIGO_GERENCIA)
					: response.OrderBy(x => x.CODIGO_GERENCIA),
				"CORR_DIVISION" => desc
					? response.OrderByDescending(x => x.CORR_DIVISION)
					: response.OrderBy(x => x.CORR_DIVISION),
				"NOMBRE_DIVISION" => desc
					? response.OrderByDescending(x => x.NOMBRE_DIVISION)
					: response.OrderBy(x => x.NOMBRE_DIVISION),
				"CODIGO_DIVISION" => desc
					? response.OrderByDescending(x => x.CODIGO_DIVISION)
					: response.OrderBy(x => x.CODIGO_DIVISION),
				"USUARIO_CREA" => desc
					? response.OrderByDescending(x => x.USUARIO_CREA)
					: response.OrderBy(x => x.USUARIO_CREA),
				"ESTACION_CREA" => desc
					? response.OrderByDescending(x => x.ESTACION_CREA)
					: response.OrderBy(x => x.ESTACION_CREA),
				"FECHA_CREA" => desc
					? response.OrderByDescending(x => x.FECHA_CREA)
					: response.OrderBy(x => x.FECHA_CREA),
				"USUARIO_ACTU" => desc
					? response.OrderByDescending(x => x.USUARIO_ACTU)
					: response.OrderBy(x => x.USUARIO_ACTU),
				"ESTACION_ACTU" => desc
					? response.OrderByDescending(x => x.ESTACION_ACTU)
					: response.OrderBy(x => x.ESTACION_ACTU),
				"FECHA_ACTU" => desc
					? response.OrderByDescending(x => x.FECHA_ACTU)
					: response.OrderBy(x => x.FECHA_ACTU),
				_ => response.OrderBy(x => x.CORR_EMPRESA).ThenBy(x => x.CORR_GERENCIA),
			};

			return ordered.ToList();
		}

		private static bool IsAllowedDistinctField(string field)
		{
			return field switch
			{
				"CORR_GERENCIA" => true,
				"NOMBRE_GERENCIA" => true,
				"CODIGO_GERENCIA" => true,
				"CORR_DIVISION" => true,
				"NOMBRE_DIVISION" => true,
				"CODIGO_DIVISION" => true,
				"USUARIO_CREA" => true,
				"ESTACION_CREA" => true,
				"FECHA_CREA" => true,
				"USUARIO_ACTU" => true,
				"ESTACION_ACTU" => true,
				"FECHA_ACTU" => true,
				_ => false,
			};
		}

		private static Dictionary<string, string> GetJsonStringFilters(List<CParameter> xWhere, string parameterName)
		{
			var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
			var json = GetFilterValue(xWhere, parameterName);

			if (string.IsNullOrWhiteSpace(json))
			{
				return result;
			}

			try
			{
				var filters = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, System.Text.Json.JsonElement>>(json);
				if (filters == null)
				{
					return result;
				}

				foreach (var filter in filters)
				{
					var value = filter.Value.ValueKind switch
					{
						System.Text.Json.JsonValueKind.String => filter.Value.GetString(),
						System.Text.Json.JsonValueKind.Number => filter.Value.GetRawText(),
						System.Text.Json.JsonValueKind.True => "true",
						System.Text.Json.JsonValueKind.False => "false",
						System.Text.Json.JsonValueKind.Null => "__BLANK__",
						_ => filter.Value.ToString(),
					};

					if (string.IsNullOrWhiteSpace(value))
					{
						continue;
					}

					result[filter.Key] = value;
				}
			}
			catch (System.Text.Json.JsonException)
			{
			}

			return result;
		}

		private static bool MatchesExactColumnValue(GEN_GERENCIAView row, string columnName, string filterValue)
		{
			if (string.Equals(filterValue, "__BLANK__", StringComparison.OrdinalIgnoreCase))
			{
				return string.IsNullOrWhiteSpace(GetColumnValue(row, columnName));
			}

			return ColumnValuesMatch(GetColumnValue(row, columnName), filterValue, columnName);
		}

		private static bool MatchesAnyOfColumnValue(GEN_GERENCIAView row, string columnName, string filterValue)
		{
			if (string.Equals(filterValue, "__BLANK__", StringComparison.OrdinalIgnoreCase))
			{
				return string.IsNullOrWhiteSpace(GetColumnValue(row, columnName));
			}

			return ColumnValuesMatch(GetColumnValue(row, columnName), filterValue, columnName);
		}

		private static bool ColumnValuesMatch(string columnValue, string filterValue, string columnName)
		{
			if (IsDateTimeColumn(columnName))
			{
				return DateTimeColumnValuesMatch(columnValue, filterValue);
			}

			if (IsNumericColumn(columnName)
				&& int.TryParse(filterValue?.Trim(), out var filterNumber)
				&& int.TryParse(columnValue?.Trim(), out var rowNumber))
			{
				return filterNumber == rowNumber;
			}

			return string.Equals(columnValue, filterValue, StringComparison.OrdinalIgnoreCase);
		}

		private static bool IsNumericColumn(string columnName)
		{
			return string.Equals(columnName, "CORR_GERENCIA", StringComparison.OrdinalIgnoreCase)
				|| string.Equals(columnName, "CORR_DIVISION", StringComparison.OrdinalIgnoreCase);
		}

		private static bool IsDateTimeColumn(string columnName)
		{
			return string.Equals(columnName, "FECHA_CREA", StringComparison.OrdinalIgnoreCase)
				|| string.Equals(columnName, "FECHA_ACTU", StringComparison.OrdinalIgnoreCase);
		}

		private static bool DateTimeColumnValuesMatch(string columnValue, string filterValue)
		{
			if (!TryParseFilterDateTime(filterValue, out var filterDate))
			{
				return string.Equals(columnValue, filterValue, StringComparison.OrdinalIgnoreCase);
			}

			if (!TryParseFilterDateTime(columnValue, out var rowDate))
			{
				return false;
			}

			return rowDate.Year == filterDate.Year
				&& rowDate.Month == filterDate.Month
				&& rowDate.Day == filterDate.Day
				&& rowDate.Hour == filterDate.Hour
				&& rowDate.Minute == filterDate.Minute;
		}

		private static bool TryParseFilterDateTime(string value, out DateTime parsed)
		{
			parsed = default;

			if (string.IsNullOrWhiteSpace(value))
			{
				return false;
			}

			var formats = new[]
			{
				"dd/MM/yyyy HH:mm",
				"dd/MM/yyyy H:mm",
				"dd/MM/yyyy",
				"yyyy-MM-ddTHH:mm:ss",
				"yyyy-MM-ddTHH:mm:ss.fff",
				"yyyy-MM-dd HH:mm:ss",
				"yyyy-MM-dd",
			};

			if (DateTime.TryParseExact(value.Trim(), formats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out parsed))
			{
				return true;
			}

			return DateTime.TryParse(value.Trim(), System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.AssumeLocal, out parsed);
		}

		private static Dictionary<string, List<string>> GetAnyOfFilters(List<CParameter> xWhere)
		{
			var result = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);
			var json = GetFilterValue(xWhere, "COLUMN_ANYOF_JSON");

			if (!string.IsNullOrWhiteSpace(json))
			{
				try
				{
					var filters = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, System.Text.Json.JsonElement>>(json);
					if (filters != null)
					{
						foreach (var filter in filters)
						{
							if (filter.Value.ValueKind != System.Text.Json.JsonValueKind.Array)
							{
								continue;
							}

							var values = filter.Value
								.EnumerateArray()
								.Select(x => x.ValueKind switch
								{
									System.Text.Json.JsonValueKind.String => x.GetString(),
									System.Text.Json.JsonValueKind.Number => x.GetRawText(),
									System.Text.Json.JsonValueKind.True => "true",
									System.Text.Json.JsonValueKind.False => "false",
									System.Text.Json.JsonValueKind.Null => "__BLANK__",
									_ => x.ToString(),
								})
								.Where(x => !string.IsNullOrWhiteSpace(x))
								.ToList();

							if (values.Count > 0)
							{
								result[filter.Key] = values;
							}
						}
					}
				}
				catch (System.Text.Json.JsonException)
				{
				}
			}

			if (result.Count > 0)
			{
				return result;
			}

			foreach (var parameter in xWhere.Where(x => x.ParameterName.EndsWith("_ANYOF", StringComparison.OrdinalIgnoreCase)))
			{
				var field = parameter.ParameterName[..^5];
				var values = parameter.Value?
					.ToString()?
					.Split('|', StringSplitOptions.RemoveEmptyEntries)
					.Select(x => x.Trim())
					.Where(x => !string.IsNullOrWhiteSpace(x))
					.ToList();

				if (values?.Count > 0)
				{
					result[field] = values;
				}
			}

			return result;
		}

		private static List<object> CollectDistinctValuesInRowOrder(
			List<GEN_GERENCIAView> rows,
			string distinctField,
			string search)
		{
			var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
			var values = new List<object>();

			foreach (var row in rows)
			{
				var value = NormalizeDistinctValue(GetDistinctValue(row, distinctField));
				var key = GetDistinctValueKey(value);

				if (!seen.Add(key))
				{
					continue;
				}

				if (!MatchesDistinctSearch(value, search))
				{
					continue;
				}

				values.Add(value);
			}

			return values;
		}

		private static string GetDistinctValueKey(object value)
		{
			if (value == null)
			{
				return "__null__";
			}

			return $"{value.GetType().FullName}:{value}";
		}

		private static object NormalizeDistinctValue(object value)
		{
			if (value == null)
			{
				return null;
			}

			if (value is string text && string.IsNullOrWhiteSpace(text))
			{
				return null;
			}

			return value;
		}

		private static bool MatchesDistinctSearch(object value, string search)
		{
			if (string.IsNullOrWhiteSpace(search))
			{
				return true;
			}

			var term = search.Trim();

			if (value == null)
			{
				return "vacio".Contains(term, StringComparison.OrdinalIgnoreCase);
			}

			return Contains(value.ToString(), term);
		}

		private static object GetDistinctValue(GEN_GERENCIAView row, string columnName)
		{
			switch (columnName)
			{
				case "CORR_GERENCIA":
					return row.CORR_GERENCIA;
				case "NOMBRE_GERENCIA":
					return row.NOMBRE_GERENCIA;
				case "CODIGO_GERENCIA":
					return row.CODIGO_GERENCIA;
				case "CORR_DIVISION":
					return row.CORR_DIVISION;
				case "NOMBRE_DIVISION":
					return row.NOMBRE_DIVISION;
				case "CODIGO_DIVISION":
					return row.CODIGO_DIVISION;
				case "USUARIO_CREA":
					return row.USUARIO_CREA;
				case "ESTACION_CREA":
					return row.ESTACION_CREA;
				case "FECHA_CREA":
					return row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm");
				case "USUARIO_ACTU":
					return row.USUARIO_ACTU;
				case "ESTACION_ACTU":
					return row.ESTACION_ACTU;
				case "FECHA_ACTU":
					return row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm");
				default:
					return null;
			}
		}

		private static string GetFilterValue(List<CParameter> xWhere, string parameterName)
		{
			return xWhere
				.Where(x => x.ParameterName == parameterName)
				.Select(x => x.Value?.ToString())
				.FirstOrDefault();
		}

		private static string GetColumnValue(GEN_GERENCIAView row, string columnName)
		{
			switch (columnName)
			{
				case "CORR_GERENCIA":
					return row.CORR_GERENCIA.ToString();
				case "NOMBRE_GERENCIA":
					return row.NOMBRE_GERENCIA;
				case "CODIGO_GERENCIA":
					return row.CODIGO_GERENCIA;
				case "CORR_DIVISION":
					return row.CORR_DIVISION?.ToString();
				case "NOMBRE_DIVISION":
					return row.NOMBRE_DIVISION;
				case "CODIGO_DIVISION":
					return row.CODIGO_DIVISION;
				case "USUARIO_CREA":
					return row.USUARIO_CREA;
				case "FECHA_CREA":
					return row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm");
				case "ESTACION_CREA":
					return row.ESTACION_CREA;
				case "USUARIO_ACTU":
					return row.USUARIO_ACTU;
				case "FECHA_ACTU":
					return row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm");
				case "ESTACION_ACTU":
					return row.ESTACION_ACTU;
				default:
					return null;
			}
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<GEN_GERENCIAView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_GERENCIA ?? 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> CreateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_GERENCIA", Value = Data.CORR_GERENCIA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "CORR_DIVISION", Value = (object)Data.CORR_DIVISION ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "NOMBRE_GERENCIA", Value = Data.NOMBRE_GERENCIA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_GERENCIA", Value = Data.CODIGO_GERENCIA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, "CORR_GERENCIA", pWhere);
				var response = new List<GEN_GERENCIAView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_GERENCIA ?? 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				var duplicateKey = IsDuplicateKeyError(e);
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = duplicateKey ? 2627 : -1;
				objResultado.ErrorMessage = duplicateKey
					? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> UpdateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_DIVISION", Value = (object)Data.CORR_DIVISION ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "NOMBRE_GERENCIA", Value = Data.NOMBRE_GERENCIA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_GERENCIA", Value = Data.CODIGO_GERENCIA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_GERENCIA", Value = Data.CORR_GERENCIA, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<GEN_GERENCIAView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_GERENCIA ?? Data.CORR_GERENCIA;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				var duplicateKey = IsDuplicateKeyError(e);
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = duplicateKey ? 2627 : -1;
				objResultado.ErrorMessage = duplicateKey
					? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> DeleteAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_GERENCIA", Value = Data.CORR_GERENCIA, DbType = System.Data.DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_GERENCIA;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = "No se puede eliminar la gerencia porque tiene registros asociados en otras tablas.";
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr)
		{
			if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(codigo))
			{
				return false;
			}

			const string sql = @"SELECT TOP 1 1 AS FOUND
				FROM V_GEN_GERENCIA
				WHERE CORR_EMPRESA = @CORR_EMPRESA
				AND UPPER(LTRIM(RTRIM(CODIGO_GERENCIA))) = UPPER(LTRIM(RTRIM(@CODIGO)))
				AND (@EXCLUDE_CORR <= 0 OR CORR_GERENCIA <> @EXCLUDE_CORR)";

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CODIGO", Value = codigo.Trim(), DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "EXCLUDE_CORR", Value = excludeCorr, DbType = System.Data.DbType.Int32 },
				});

				var exists = reader.Read();
				reader.Close();
				return exists;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		private static bool Contains(string value, string search)
		{
			return !string.IsNullOrWhiteSpace(value) &&
				value.Contains(search, StringComparison.OrdinalIgnoreCase);
		}

		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
		}
	}
}
