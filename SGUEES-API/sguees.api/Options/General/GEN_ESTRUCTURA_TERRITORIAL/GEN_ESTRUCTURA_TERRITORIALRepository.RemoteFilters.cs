using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public partial class GEN_ESTRUCTURA_TERRITORIALRepository
	{
		private static readonly HashSet<string> _PaisDistinctFields = new(StringComparer.OrdinalIgnoreCase)
		{
			"CORR_PAIS", "NOMBRE_PAIS", "CODIGO_PAIS", "NACIONALIDAD", "NOMBRE_CORTO",
			"USUARIO_CREA", "ESTACION_CREA", "FECHA_CREA", "USUARIO_ACTU", "ESTACION_ACTU", "FECHA_ACTU",
		};

		private static readonly HashSet<string> _DeptoDistinctFields = new(StringComparer.OrdinalIgnoreCase)
		{
			"CORR_DEPTO", "NOMBRE_DEPTO", "CODIGO_DEPTO",
			"USUARIO_CREA", "ESTACION_CREA", "FECHA_CREA", "USUARIO_ACTU", "ESTACION_ACTU", "FECHA_ACTU",
		};

		private static readonly HashSet<string> _MunicipioDistinctFields = new(StringComparer.OrdinalIgnoreCase)
		{
			"CORR_MUNICIPIO", "NOMBRE_MUNICIPIO", "CODIGO_MUNICIPIO",
			"USUARIO_CREA", "ESTACION_CREA", "FECHA_CREA", "USUARIO_ACTU", "ESTACION_ACTU", "FECHA_ACTU",
		};

		private static readonly HashSet<string> _DistritoDistinctFields = new(StringComparer.OrdinalIgnoreCase)
		{
			"CORR_DISTRITO", "NOMBRE_DISTRITO",
			"USUARIO_CREA", "ESTACION_CREA", "FECHA_CREA", "USUARIO_ACTU", "ESTACION_ACTU", "FECHA_ACTU",
		};

		public async Task<CResult> GetDistinctValuesPaisesAsync(List<CParameter> xWhere)
		{
			return await GetDistinctValuesAsync(
				xWhere,
				_PaisDistinctFields,
				FilterPaisesQueryAsync,
				"[GEN_ESTRUCTURA_TERRITORIALRepository.GetDistinctValuesPaises]");
		}

		public async Task<CResult> GetDistinctValuesDeptosAsync(List<CParameter> xWhere)
		{
			return await GetDistinctValuesAsync(
				xWhere,
				_DeptoDistinctFields,
				FilterDeptosQueryAsync,
				"[GEN_ESTRUCTURA_TERRITORIALRepository.GetDistinctValuesDeptos]");
		}

		public async Task<CResult> GetDistinctValuesMunicipiosAsync(List<CParameter> xWhere)
		{
			return await GetDistinctValuesAsync(
				xWhere,
				_MunicipioDistinctFields,
				FilterMunicipiosQueryAsync,
				"[GEN_ESTRUCTURA_TERRITORIALRepository.GetDistinctValuesMunicipios]");
		}

		public async Task<CResult> GetDistinctValuesDistritosAsync(List<CParameter> xWhere)
		{
			return await GetDistinctValuesAsync(
				xWhere,
				_DistritoDistinctFields,
				FilterDistritosQueryAsync,
				"[GEN_ESTRUCTURA_TERRITORIALRepository.GetDistinctValuesDistritos]");
		}

		private async Task<CResult> GetDistinctValuesAsync<TView>(
			List<CParameter> xWhere,
			HashSet<string> allowedFields,
			Func<List<CParameter>, string, Task<List<TView>>> filterQueryAsync,
			string errorSource)
		{
			CResult objResultado = new();

			try
			{
				var distinctField = GetFilterValue(xWhere, "DISTINCT_FIELD")?.Trim();
				var search = GetFilterValue(xWhere, "HEADER_FILTER_SEARCH");

				if (string.IsNullOrWhiteSpace(distinctField) || !allowedFields.Contains(distinctField))
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "El campo solicitado no es valido para el filtro de encabezado.";
					objResultado.ErrorSource = errorSource;
					return objResultado;
				}

				var response = await filterQueryAsync(xWhere, null);
				var values = typeof(TView) switch
				{
					var t when t == typeof(GEN_ESTRUCTURA_TERRITORIAL_PAISView) =>
						CollectDistinctValuesInRowOrder(
							response,
							distinctField,
							search,
							(row, field) => GetPaisDistinctValue((GEN_ESTRUCTURA_TERRITORIAL_PAISView)(object)row, field)),
					var t when t == typeof(GEN_ESTRUCTURA_TERRITORIAL_DEPTOView) =>
						CollectDistinctValuesInRowOrder(
							response,
							distinctField,
							search,
							(row, field) => GetDeptoDistinctValue((GEN_ESTRUCTURA_TERRITORIAL_DEPTOView)(object)row, field)),
					var t when t == typeof(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView) =>
						CollectDistinctValuesInRowOrder(
							response,
							distinctField,
							search,
							(row, field) => GetMunicipioDistinctValue((GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView)(object)row, field)),
					var t when t == typeof(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView) =>
						CollectDistinctValuesInRowOrder(
							response,
							distinctField,
							search,
							(row, field) => GetDistritoDistinctValue((GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView)(object)row, field)),
					_ => new List<object>(),
				};

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

		private async Task<List<GEN_ESTRUCTURA_TERRITORIAL_PAISView>> FilterPaisesQueryAsync(List<CParameter> xWhere, string skipColumnFilter = null)
		{
			var busqueda = GetFilterValue(xWhere, "BUSQUEDA");
			var filterRowFilters = GetJsonStringFilters(xWhere, "FILTER_ROW_JSON")
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToList();
			var exactColumnFilters = GetJsonStringFilters(xWhere, "COLUMN_EXACT_JSON")
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToList();
			var anyOfFilters = GetAnyOfFilters(xWhere)
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);

			var reader = await objData.GetDataReader("V_" + _PaisTable, new List<CParameter>());
			var response = new List<GEN_ESTRUCTURA_TERRITORIAL_PAISView>().FromDataReader(reader).ToList();
			reader.Close();

			if (!string.IsNullOrWhiteSpace(busqueda))
			{
				var search = busqueda.Trim();
				response = response.Where(row => GetPaisSearchValues(row).Any(value => Contains(value, search))).ToList();
			}

			response = ApplyColumnFilters(response, filterRowFilters, exactColumnFilters, anyOfFilters, GetPaisColumnValue);
			return ApplyPaisSort(response, xWhere);
		}

		private async Task<List<GEN_ESTRUCTURA_TERRITORIAL_DEPTOView>> FilterDeptosQueryAsync(List<CParameter> xWhere, string skipColumnFilter = null)
		{
			var dbWhere = xWhere.Where(x => x.ParameterName == "CORR_PAIS").ToList();
			var busqueda = GetFilterValue(xWhere, "BUSQUEDA");
			var filterRowFilters = GetJsonStringFilters(xWhere, "FILTER_ROW_JSON")
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToList();
			var exactColumnFilters = GetJsonStringFilters(xWhere, "COLUMN_EXACT_JSON")
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToList();
			var anyOfFilters = GetAnyOfFilters(xWhere)
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);

			var reader = await objData.GetDataReader("V_" + _DeptoTable, dbWhere);
			var response = new List<GEN_ESTRUCTURA_TERRITORIAL_DEPTOView>().FromDataReader(reader).ToList();
			reader.Close();

			if (!string.IsNullOrWhiteSpace(busqueda))
			{
				var search = busqueda.Trim();
				response = response.Where(row => GetDeptoSearchValues(row).Any(value => Contains(value, search))).ToList();
			}

			response = ApplyColumnFilters(response, filterRowFilters, exactColumnFilters, anyOfFilters, GetDeptoColumnValue);
			return ApplyDeptoSort(response, xWhere);
		}

		private async Task<List<GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView>> FilterMunicipiosQueryAsync(List<CParameter> xWhere, string skipColumnFilter = null)
		{
			var dbWhere = xWhere.Where(x => x.ParameterName is "CORR_PAIS" or "CORR_DEPTO").ToList();
			var busqueda = GetFilterValue(xWhere, "BUSQUEDA");
			var filterRowFilters = GetJsonStringFilters(xWhere, "FILTER_ROW_JSON")
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToList();
			var exactColumnFilters = GetJsonStringFilters(xWhere, "COLUMN_EXACT_JSON")
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToList();
			var anyOfFilters = GetAnyOfFilters(xWhere)
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);

			var reader = await objData.GetDataReader("V_" + _MunicipioTable, dbWhere);
			var response = new List<GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView>().FromDataReader(reader).ToList();
			reader.Close();

			if (!string.IsNullOrWhiteSpace(busqueda))
			{
				var search = busqueda.Trim();
				response = response.Where(row => GetMunicipioSearchValues(row).Any(value => Contains(value, search))).ToList();
			}

			response = ApplyColumnFilters(response, filterRowFilters, exactColumnFilters, anyOfFilters, GetMunicipioColumnValue);
			return ApplyMunicipioSort(response, xWhere);
		}

		private async Task<List<GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView>> FilterDistritosQueryAsync(List<CParameter> xWhere, string skipColumnFilter = null)
		{
			var dbWhere = xWhere.Where(x => x.ParameterName is "CORR_PAIS" or "CORR_DEPTO" or "CORR_MUNICIPIO").ToList();
			var busqueda = GetFilterValue(xWhere, "BUSQUEDA");
			var filterRowFilters = GetJsonStringFilters(xWhere, "FILTER_ROW_JSON")
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToList();
			var exactColumnFilters = GetJsonStringFilters(xWhere, "COLUMN_EXACT_JSON")
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToList();
			var anyOfFilters = GetAnyOfFilters(xWhere)
				.Where(x => !string.Equals(x.Key, skipColumnFilter, StringComparison.OrdinalIgnoreCase))
				.ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);

			var reader = await objData.GetDataReader("V_" + _DistritoTable, dbWhere);
			var response = new List<GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView>().FromDataReader(reader).ToList();
			reader.Close();

			if (!string.IsNullOrWhiteSpace(busqueda))
			{
				var search = busqueda.Trim();
				response = response.Where(row => GetDistritoSearchValues(row).Any(value => Contains(value, search))).ToList();
			}

			response = ApplyColumnFilters(response, filterRowFilters, exactColumnFilters, anyOfFilters, GetDistritoColumnValue);
			return ApplyDistritoSort(response, xWhere);
		}

		private static List<GEN_ESTRUCTURA_TERRITORIAL_PAISView> ApplyPaisSort(List<GEN_ESTRUCTURA_TERRITORIAL_PAISView> response, List<CParameter> xWhere)
		{
			return ApplySort(
				response,
				xWhere,
				_PaisDistinctFields,
				items => items.OrderBy(x => x.CORR_PAIS),
				new Dictionary<string, Func<IEnumerable<GEN_ESTRUCTURA_TERRITORIAL_PAISView>, bool, IOrderedEnumerable<GEN_ESTRUCTURA_TERRITORIAL_PAISView>>>(StringComparer.OrdinalIgnoreCase)
				{
					["CORR_PAIS"] = (items, desc) => desc ? items.OrderByDescending(x => x.CORR_PAIS) : items.OrderBy(x => x.CORR_PAIS),
					["NOMBRE_PAIS"] = (items, desc) => desc ? items.OrderByDescending(x => x.NOMBRE_PAIS) : items.OrderBy(x => x.NOMBRE_PAIS),
					["CODIGO_PAIS"] = (items, desc) => desc ? items.OrderByDescending(x => x.CODIGO_PAIS) : items.OrderBy(x => x.CODIGO_PAIS),
					["NACIONALIDAD"] = (items, desc) => desc ? items.OrderByDescending(x => x.NACIONALIDAD) : items.OrderBy(x => x.NACIONALIDAD),
					["NOMBRE_CORTO"] = (items, desc) => desc ? items.OrderByDescending(x => x.NOMBRE_CORTO) : items.OrderBy(x => x.NOMBRE_CORTO),
					["USUARIO_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.USUARIO_CREA) : items.OrderBy(x => x.USUARIO_CREA),
					["ESTACION_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.ESTACION_CREA) : items.OrderBy(x => x.ESTACION_CREA),
					["FECHA_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.FECHA_CREA) : items.OrderBy(x => x.FECHA_CREA),
					["USUARIO_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.USUARIO_ACTU) : items.OrderBy(x => x.USUARIO_ACTU),
					["ESTACION_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.ESTACION_ACTU) : items.OrderBy(x => x.ESTACION_ACTU),
					["FECHA_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.FECHA_ACTU) : items.OrderBy(x => x.FECHA_ACTU),
				});
		}

		private static List<GEN_ESTRUCTURA_TERRITORIAL_DEPTOView> ApplyDeptoSort(List<GEN_ESTRUCTURA_TERRITORIAL_DEPTOView> response, List<CParameter> xWhere)
		{
			return ApplySort(
				response,
				xWhere,
				_DeptoDistinctFields,
				items => items.OrderBy(x => x.CORR_DEPTO),
				new Dictionary<string, Func<IEnumerable<GEN_ESTRUCTURA_TERRITORIAL_DEPTOView>, bool, IOrderedEnumerable<GEN_ESTRUCTURA_TERRITORIAL_DEPTOView>>>(StringComparer.OrdinalIgnoreCase)
				{
					["CORR_DEPTO"] = (items, desc) => desc ? items.OrderByDescending(x => x.CORR_DEPTO) : items.OrderBy(x => x.CORR_DEPTO),
					["NOMBRE_DEPTO"] = (items, desc) => desc ? items.OrderByDescending(x => x.NOMBRE_DEPTO) : items.OrderBy(x => x.NOMBRE_DEPTO),
					["CODIGO_DEPTO"] = (items, desc) => desc ? items.OrderByDescending(x => x.CODIGO_DEPTO) : items.OrderBy(x => x.CODIGO_DEPTO),
					["USUARIO_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.USUARIO_CREA) : items.OrderBy(x => x.USUARIO_CREA),
					["ESTACION_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.ESTACION_CREA) : items.OrderBy(x => x.ESTACION_CREA),
					["FECHA_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.FECHA_CREA) : items.OrderBy(x => x.FECHA_CREA),
					["USUARIO_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.USUARIO_ACTU) : items.OrderBy(x => x.USUARIO_ACTU),
					["ESTACION_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.ESTACION_ACTU) : items.OrderBy(x => x.ESTACION_ACTU),
					["FECHA_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.FECHA_ACTU) : items.OrderBy(x => x.FECHA_ACTU),
				});
		}

		private static List<GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView> ApplyMunicipioSort(List<GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView> response, List<CParameter> xWhere)
		{
			return ApplySort(
				response,
				xWhere,
				_MunicipioDistinctFields,
				items => items.OrderBy(x => x.CORR_MUNICIPIO),
				new Dictionary<string, Func<IEnumerable<GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView>, bool, IOrderedEnumerable<GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView>>>(StringComparer.OrdinalIgnoreCase)
				{
					["CORR_MUNICIPIO"] = (items, desc) => desc ? items.OrderByDescending(x => x.CORR_MUNICIPIO) : items.OrderBy(x => x.CORR_MUNICIPIO),
					["NOMBRE_MUNICIPIO"] = (items, desc) => desc ? items.OrderByDescending(x => x.NOMBRE_MUNICIPIO) : items.OrderBy(x => x.NOMBRE_MUNICIPIO),
					["CODIGO_MUNICIPIO"] = (items, desc) => desc ? items.OrderByDescending(x => x.CODIGO_MUNICIPIO) : items.OrderBy(x => x.CODIGO_MUNICIPIO),
					["USUARIO_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.USUARIO_CREA) : items.OrderBy(x => x.USUARIO_CREA),
					["ESTACION_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.ESTACION_CREA) : items.OrderBy(x => x.ESTACION_CREA),
					["FECHA_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.FECHA_CREA) : items.OrderBy(x => x.FECHA_CREA),
					["USUARIO_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.USUARIO_ACTU) : items.OrderBy(x => x.USUARIO_ACTU),
					["ESTACION_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.ESTACION_ACTU) : items.OrderBy(x => x.ESTACION_ACTU),
					["FECHA_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.FECHA_ACTU) : items.OrderBy(x => x.FECHA_ACTU),
				});
		}

		private static List<GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView> ApplyDistritoSort(List<GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView> response, List<CParameter> xWhere)
		{
			return ApplySort(
				response,
				xWhere,
				_DistritoDistinctFields,
				items => items.OrderBy(x => x.CORR_DISTRITO),
				new Dictionary<string, Func<IEnumerable<GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView>, bool, IOrderedEnumerable<GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView>>>(StringComparer.OrdinalIgnoreCase)
				{
					["CORR_DISTRITO"] = (items, desc) => desc ? items.OrderByDescending(x => x.CORR_DISTRITO) : items.OrderBy(x => x.CORR_DISTRITO),
					["NOMBRE_DISTRITO"] = (items, desc) => desc ? items.OrderByDescending(x => x.NOMBRE_DISTRITO) : items.OrderBy(x => x.NOMBRE_DISTRITO),
					["USUARIO_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.USUARIO_CREA) : items.OrderBy(x => x.USUARIO_CREA),
					["ESTACION_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.ESTACION_CREA) : items.OrderBy(x => x.ESTACION_CREA),
					["FECHA_CREA"] = (items, desc) => desc ? items.OrderByDescending(x => x.FECHA_CREA) : items.OrderBy(x => x.FECHA_CREA),
					["USUARIO_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.USUARIO_ACTU) : items.OrderBy(x => x.USUARIO_ACTU),
					["ESTACION_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.ESTACION_ACTU) : items.OrderBy(x => x.ESTACION_ACTU),
					["FECHA_ACTU"] = (items, desc) => desc ? items.OrderByDescending(x => x.FECHA_ACTU) : items.OrderBy(x => x.FECHA_ACTU),
				});
		}

		private static object GetPaisDistinctValue(GEN_ESTRUCTURA_TERRITORIAL_PAISView row, string columnName) => columnName switch
		{
			"CORR_PAIS" => row.CORR_PAIS,
			"NOMBRE_PAIS" => row.NOMBRE_PAIS,
			"CODIGO_PAIS" => row.CODIGO_PAIS,
			"NACIONALIDAD" => row.NACIONALIDAD,
			"NOMBRE_CORTO" => row.NOMBRE_CORTO,
			"USUARIO_CREA" => row.USUARIO_CREA,
			"ESTACION_CREA" => row.ESTACION_CREA,
			"FECHA_CREA" => row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm"),
			"USUARIO_ACTU" => row.USUARIO_ACTU,
			"ESTACION_ACTU" => row.ESTACION_ACTU,
			"FECHA_ACTU" => row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm"),
			_ => null,
		};

		private static object GetDeptoDistinctValue(GEN_ESTRUCTURA_TERRITORIAL_DEPTOView row, string columnName) => columnName switch
		{
			"CORR_DEPTO" => row.CORR_DEPTO,
			"NOMBRE_DEPTO" => row.NOMBRE_DEPTO,
			"CODIGO_DEPTO" => row.CODIGO_DEPTO,
			"USUARIO_CREA" => row.USUARIO_CREA,
			"ESTACION_CREA" => row.ESTACION_CREA,
			"FECHA_CREA" => row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm"),
			"USUARIO_ACTU" => row.USUARIO_ACTU,
			"ESTACION_ACTU" => row.ESTACION_ACTU,
			"FECHA_ACTU" => row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm"),
			_ => null,
		};

		private static object GetMunicipioDistinctValue(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView row, string columnName) => columnName switch
		{
			"CORR_MUNICIPIO" => row.CORR_MUNICIPIO,
			"NOMBRE_MUNICIPIO" => row.NOMBRE_MUNICIPIO,
			"CODIGO_MUNICIPIO" => row.CODIGO_MUNICIPIO,
			"USUARIO_CREA" => row.USUARIO_CREA,
			"ESTACION_CREA" => row.ESTACION_CREA,
			"FECHA_CREA" => row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm"),
			"USUARIO_ACTU" => row.USUARIO_ACTU,
			"ESTACION_ACTU" => row.ESTACION_ACTU,
			"FECHA_ACTU" => row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm"),
			_ => null,
		};

		private static object GetDistritoDistinctValue(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView row, string columnName) => columnName switch
		{
			"CORR_DISTRITO" => row.CORR_DISTRITO,
			"NOMBRE_DISTRITO" => row.NOMBRE_DISTRITO,
			"USUARIO_CREA" => row.USUARIO_CREA,
			"ESTACION_CREA" => row.ESTACION_CREA,
			"FECHA_CREA" => row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm"),
			"USUARIO_ACTU" => row.USUARIO_ACTU,
			"ESTACION_ACTU" => row.ESTACION_ACTU,
			"FECHA_ACTU" => row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm"),
			_ => null,
		};

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
				var filters = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);
				if (filters == null)
				{
					return result;
				}

				foreach (var filter in filters)
				{
					var value = filter.Value.ValueKind switch
					{
						JsonValueKind.String => filter.Value.GetString(),
						JsonValueKind.Number => filter.Value.GetRawText(),
						JsonValueKind.True => "true",
						JsonValueKind.False => "false",
						JsonValueKind.Null => "__BLANK__",
						_ => filter.Value.ToString(),
					};

					if (string.IsNullOrWhiteSpace(value))
					{
						continue;
					}

					result[filter.Key] = value;
				}
			}
			catch (JsonException)
			{
			}

			return result;
		}

		private static Dictionary<string, List<string>> GetAnyOfFilters(List<CParameter> xWhere)
		{
			var result = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);
			var json = GetFilterValue(xWhere, "COLUMN_ANYOF_JSON");

			if (!string.IsNullOrWhiteSpace(json))
			{
				try
				{
					var filters = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);
					if (filters != null)
					{
						foreach (var filter in filters)
						{
							if (filter.Value.ValueKind != JsonValueKind.Array)
							{
								continue;
							}

							var values = filter.Value
								.EnumerateArray()
								.Select(x => x.ValueKind switch
								{
									JsonValueKind.String => x.GetString(),
									JsonValueKind.Number => x.GetRawText(),
									JsonValueKind.True => "true",
									JsonValueKind.False => "false",
									JsonValueKind.Null => "__BLANK__",
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
				catch (JsonException)
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

		private static List<T> ApplyColumnFilters<T>(
			List<T> response,
			List<KeyValuePair<string, string>> filterRowFilters,
			List<KeyValuePair<string, string>> exactColumnFilters,
			Dictionary<string, List<string>> anyOfFilters,
			Func<T, string, string> getColumnValue,
			Func<T, string, string, bool> matchesExactColumnValue = null)
		{
			matchesExactColumnValue ??= CreateDefaultMatchesExactColumnValue(getColumnValue);

			var containsByField = filterRowFilters.ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);
			var exactByField = exactColumnFilters.ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);

			if (IsCrossColumnFilter(anyOfFilters, containsByField, exactByField))
			{
				return response
					.Where(x =>
						MatchesAnyOfFilters(x, anyOfFilters, matchesExactColumnValue) ||
						MatchesFilterRowFilters(x, containsByField, exactByField, getColumnValue, matchesExactColumnValue))
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
							(hasAnyOf && anyOfValues.Any(value => matchesExactColumnValue(x, field, value))) ||
							(hasExact && matchesExactColumnValue(x, field, exactValue)) ||
							(hasContains && Contains(getColumnValue(x, field), containsValue)))
						.ToList();
					continue;
				}

				if (hasAnyOf)
				{
					response = response
						.Where(x => anyOfValues.Any(value => matchesExactColumnValue(x, field, value)))
						.ToList();
					continue;
				}

				if (hasExact)
				{
					response = response
						.Where(x => matchesExactColumnValue(x, field, exactValue))
						.ToList();
					continue;
				}

				response = response
					.Where(x => Contains(getColumnValue(x, field), containsValue))
					.ToList();
			}

			return response;
		}

		private static List<T> ApplySort<T>(
			List<T> response,
			List<CParameter> xWhere,
			HashSet<string> allowedSortFields,
			Func<IEnumerable<T>, IOrderedEnumerable<T>> defaultSort,
			IReadOnlyDictionary<string, Func<IEnumerable<T>, bool, IOrderedEnumerable<T>>> fieldSortSelectors)
		{
			var sortField = GetFilterValue(xWhere, "SORT_FIELD")?.Trim();
			var sortDescValue = xWhere
				.Where(x => x.ParameterName == "SORT_DESC")
				.Select(x => x.Value as bool?)
				.FirstOrDefault();

			if (string.IsNullOrWhiteSpace(sortField)
				|| allowedSortFields == null
				|| !allowedSortFields.Contains(sortField))
			{
				return defaultSort(response).ToList();
			}

			var desc = sortDescValue ?? false;

			if (fieldSortSelectors != null
				&& fieldSortSelectors.TryGetValue(sortField, out var sortSelector))
			{
				return sortSelector(response, desc).ToList();
			}

			return defaultSort(response).ToList();
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

		private static bool MatchesAnyOfFilters<T>(
			T row,
			Dictionary<string, List<string>> anyOfFilters,
			Func<T, string, string, bool> matchesExactColumnValue)
		{
			foreach (var filter in anyOfFilters)
			{
				if (filter.Value?.Any(value => matchesExactColumnValue(row, filter.Key, value)) != true)
				{
					return false;
				}
			}

			return anyOfFilters.Count > 0;
		}

		private static bool MatchesFilterRowFilters<T>(
			T row,
			Dictionary<string, string> containsByField,
			Dictionary<string, string> exactByField,
			Func<T, string, string> getColumnValue,
			Func<T, string, string, bool> matchesExactColumnValue)
		{
			foreach (var filter in containsByField)
			{
				if (!Contains(getColumnValue(row, filter.Key), filter.Value))
				{
					return false;
				}
			}

			foreach (var filter in exactByField)
			{
				if (!matchesExactColumnValue(row, filter.Key, filter.Value))
				{
					return false;
				}
			}

			return containsByField.Count + exactByField.Count > 0;
		}

		private static Func<T, string, string, bool> CreateDefaultMatchesExactColumnValue<T>(Func<T, string, string> getColumnValue)
		{
			return (row, columnName, filterValue) =>
			{
				if (string.Equals(filterValue, "__BLANK__", StringComparison.OrdinalIgnoreCase))
				{
					return string.IsNullOrWhiteSpace(getColumnValue(row, columnName));
				}

				return ColumnValuesMatch(getColumnValue(row, columnName), filterValue, columnName);
			};
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
			return columnName?.StartsWith("CORR_", StringComparison.OrdinalIgnoreCase) == true;
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

			if (DateTime.TryParseExact(value.Trim(), formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out parsed))
			{
				return true;
			}

			return DateTime.TryParse(value.Trim(), CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out parsed);
		}

		private static List<object> CollectDistinctValuesInRowOrder<T>(
			List<T> rows,
			string distinctField,
			string search,
			Func<T, string, object> getDistinctValue)
		{
			var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
			var values = new List<object>();

			foreach (var row in rows)
			{
				var value = NormalizeDistinctValue(getDistinctValue(row, distinctField));
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
	}
}
