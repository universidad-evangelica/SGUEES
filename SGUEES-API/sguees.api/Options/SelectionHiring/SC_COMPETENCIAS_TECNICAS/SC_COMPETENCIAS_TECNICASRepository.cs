using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public class SC_COMPETENCIAS_TECNICASRepository : BaseRepository<SC_COMPETENCIAS_TECNICASTable>, ISC_COMPETENCIAS_TECNICASRepository
    {
        private const string _TableName = "SC_COMPETENCIAS_TECNICAS";

        public SC_COMPETENCIAS_TECNICASRepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var page = xWhere
                    .Where(x => x.ParameterName == "PAGE")
                    .Select(x => Convert.ToInt32(x.Value ?? 1))
                    .FirstOrDefault();

                var pageSize = xWhere
                    .Where(x => x.ParameterName == "PAGE_SIZE")
                    .Select(x => Convert.ToInt32(x.Value ?? 10))
                    .FirstOrDefault();

                page = page < 1 ? 1 : page;
                pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 100);

                var response = await FilterQueryAsync(xWhere);
                var totalRows = response.Count;
                var pageData = response
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                objResultado.Data = pageData;
                objResultado.Result = true;
                objResultado.RowsAffected = totalRows;
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
                    objResultado.ErrorSource = "[SC_COMPETENCIAS_TECNICASRepository]";
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

        private async Task<List<SC_COMPETENCIAS_TECNICASView>> FilterQueryAsync(List<CParameter> xWhere, string skipColumnFilter = null)
        {
            var dbWhere = xWhere
                .Where(x => x.ParameterName == "CORR_EMPRESA")
                .ToList();

            var estado = xWhere
                .Where(x => x.ParameterName == "ESTADO_COMPETENCIAS_TECNICAS")
                .Select(x => x.Value as bool?)
                .FirstOrDefault();

            var busqueda = xWhere
                .Where(x => x.ParameterName == "BUSQUEDA")
                .Select(x => x.Value?.ToString())
                .FirstOrDefault();

            var nivel = xWhere
                .Where(x => x.ParameterName == "NIVEL")
                .Select(x => x.Value?.ToString())
                .FirstOrDefault();

            var nivelPadre = xWhere
                .Where(x => x.ParameterName == "NIVEL_PADRE")
                .Select(x => x.Value?.ToString())
                .FirstOrDefault();

            var corrPadre = xWhere
                .Where(x => x.ParameterName == "CORR_COMPETENCIAS_TECNICAS_PADRE")
                .Select(x => x.Value as int?)
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
            var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).ToList();

            reader.Close();
            reader = null;

            if (estado.HasValue)
            {
                response = estado.Value
                    ? response
                        .Where(x => x.ESTADO_COMPETENCIAS_TECNICAS.HasValue && x.ESTADO_COMPETENCIAS_TECNICAS.Value)
                        .ToList()
                    : response
                        .Where(x => x.ESTADO_COMPETENCIAS_TECNICAS.HasValue && !x.ESTADO_COMPETENCIAS_TECNICAS.Value)
                        .ToList();
            }

            if (!string.IsNullOrWhiteSpace(nivel))
            {
                response = response
                    .Where(x => string.Equals(x.NIVEL, nivel.Trim(), StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            if (!string.IsNullOrWhiteSpace(nivelPadre))
            {
                response = response
                    .Where(x => string.Equals(x.NIVEL_PADRE, nivelPadre.Trim(), StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            if (corrPadre.HasValue && corrPadre.Value > 0)
            {
                response = response
                    .Where(x => x.CORR_COMPETENCIAS_TECNICAS_PADRE == corrPadre.Value)
                    .ToList();
            }

            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                var search = busqueda.Trim();
                response = response
                    .Where(x =>
                        Contains(x.CORR_EMPRESA.ToString(), search) ||
                        Contains(x.CORR_COMPETENCIAS_TECNICAS.ToString(), search) ||
                        Contains(x.CORR_COMPETENCIAS_TECNICAS_PADRE?.ToString(), search) ||
                        Contains(x.CODIGO_COMPETENCIAS_TECNICAS, search) ||
                        Contains(x.NOMBRE_COMPETENCIAS_TECNICAS, search) ||
                        Contains(x.DESCRIPCION, search) ||
                        Contains(x.NIVEL, search) ||
                        Contains(x.CODIGO_PADRE, search) ||
                        Contains(x.NOMBRE_PADRE, search) ||
                        Contains(x.NIVEL_PADRE, search) ||
                        Contains((x.ESTADO_COMPETENCIAS_TECNICAS ?? false) ? "Activo" : "Inactivo", search) ||
                        Contains(x.USUARIO_CREA, search) ||
                        Contains(x.ESTACION_CREA, search) ||
                        Contains(x.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm"), search) ||
                        Contains(x.USUARIO_ACTU, search) ||
                        Contains(x.ESTACION_ACTU, search) ||
                        Contains(x.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm"), search))
                    .ToList();
            }

            response = ApplyColumnFilters(response, filterRowFilters, exactColumnFilters, anyOfFilters);

            return ApplySort(response, xWhere);
        }

        private static List<SC_COMPETENCIAS_TECNICASView> ApplyColumnFilters(
            List<SC_COMPETENCIAS_TECNICASView> response,
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
                        MatchesAnyOfFilters(x, anyOfFilters) ||
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
                            (hasAnyOf && anyOfValues.Any(value => MatchesAnyOfColumnValue(x, field, value))) ||
                            (hasExact && MatchesExactColumnValue(x, field, exactValue)) ||
                            (hasContains && Contains(GetColumnValue(x, field), containsValue)))
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
            SC_COMPETENCIAS_TECNICASView row,
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
            SC_COMPETENCIAS_TECNICASView row,
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

        private static List<SC_COMPETENCIAS_TECNICASView> ApplySort(List<SC_COMPETENCIAS_TECNICASView> response, List<CParameter> xWhere)
        {
            var sortField = GetFilterValue(xWhere, "SORT_FIELD")?.Trim();
            var sortDescValue = xWhere
                .Where(x => x.ParameterName == "SORT_DESC")
                .Select(x => x.Value as bool?)
                .FirstOrDefault();

            if (string.IsNullOrWhiteSpace(sortField) || !IsAllowedDistinctField(sortField))
            {
                return response
                    .OrderBy(x => x.CORR_COMPETENCIAS_TECNICAS)
                    .ThenBy(x => x.FECHA_CREA)
                    .ToList();
            }

            var desc = sortDescValue ?? false;
            IEnumerable<SC_COMPETENCIAS_TECNICASView> ordered = sortField switch
            {
                "CORR_COMPETENCIAS_TECNICAS" => desc
                    ? response.OrderByDescending(x => x.CORR_COMPETENCIAS_TECNICAS)
                    : response.OrderBy(x => x.CORR_COMPETENCIAS_TECNICAS),
                "CODIGO_COMPETENCIAS_TECNICAS" => desc
                    ? response.OrderByDescending(x => x.CODIGO_COMPETENCIAS_TECNICAS)
                    : response.OrderBy(x => x.CODIGO_COMPETENCIAS_TECNICAS),
                "NOMBRE_COMPETENCIAS_TECNICAS" => desc
                    ? response.OrderByDescending(x => x.NOMBRE_COMPETENCIAS_TECNICAS)
                    : response.OrderBy(x => x.NOMBRE_COMPETENCIAS_TECNICAS),
                "DESCRIPCION" => desc
                    ? response.OrderByDescending(x => x.DESCRIPCION)
                    : response.OrderBy(x => x.DESCRIPCION),
                "NIVEL" => desc
                    ? response.OrderByDescending(x => x.NIVEL)
                    : response.OrderBy(x => x.NIVEL),
                "CODIGO_PADRE" => desc
                    ? response.OrderByDescending(x => x.CODIGO_PADRE)
                    : response.OrderBy(x => x.CODIGO_PADRE),
                "ESTADO_COMPETENCIAS_TECNICAS" => desc
                    ? response.OrderByDescending(x => x.ESTADO_COMPETENCIAS_TECNICAS ?? false)
                    : response.OrderBy(x => x.ESTADO_COMPETENCIAS_TECNICAS ?? false),
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
                _ => response.OrderBy(x => x.CORR_COMPETENCIAS_TECNICAS).ThenBy(x => x.FECHA_CREA),
            };

            return ordered.ToList();
        }

        private static bool IsAllowedDistinctField(string field)
        {
            return field switch
            {
                "CORR_COMPETENCIAS_TECNICAS" => true,
                "CODIGO_COMPETENCIAS_TECNICAS" => true,
                "NOMBRE_COMPETENCIAS_TECNICAS" => true,
                "DESCRIPCION" => true,
                "NIVEL" => true,
                "CODIGO_PADRE" => true,
                "ESTADO_COMPETENCIAS_TECNICAS" => true,
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

        private static bool MatchesExactColumnValue(SC_COMPETENCIAS_TECNICASView row, string columnName, string filterValue)
        {
            if (string.Equals(columnName, "ESTADO_COMPETENCIAS_TECNICAS", StringComparison.OrdinalIgnoreCase))
            {
                return MatchesEstadoColumnValue(row, filterValue);
            }

            if (string.Equals(filterValue, "__BLANK__", StringComparison.OrdinalIgnoreCase))
            {
                return string.IsNullOrWhiteSpace(GetColumnValue(row, columnName));
            }

            return ColumnValuesMatch(GetColumnValue(row, columnName), filterValue, columnName);
        }

        private static bool MatchesAnyOfColumnValue(SC_COMPETENCIAS_TECNICASView row, string columnName, string filterValue)
        {
            if (string.Equals(columnName, "ESTADO_COMPETENCIAS_TECNICAS", StringComparison.OrdinalIgnoreCase))
            {
                return MatchesEstadoColumnValue(row, filterValue);
            }

            if (string.Equals(filterValue, "__BLANK__", StringComparison.OrdinalIgnoreCase))
            {
                return string.IsNullOrWhiteSpace(GetColumnValue(row, columnName));
            }

            return ColumnValuesMatch(GetColumnValue(row, columnName), filterValue, columnName);
        }

        private static bool MatchesEstadoColumnValue(SC_COMPETENCIAS_TECNICASView row, string filterValue)
        {
            if (string.Equals(filterValue, "__BLANK__", StringComparison.OrdinalIgnoreCase))
            {
                return !row.ESTADO_COMPETENCIAS_TECNICAS.HasValue;
            }

            if (!row.ESTADO_COMPETENCIAS_TECNICAS.HasValue)
            {
                return false;
            }

            if (string.Equals(filterValue, "true", StringComparison.OrdinalIgnoreCase)
                || string.Equals(filterValue, "Activo", StringComparison.OrdinalIgnoreCase))
            {
                return row.ESTADO_COMPETENCIAS_TECNICAS.Value;
            }

            if (string.Equals(filterValue, "false", StringComparison.OrdinalIgnoreCase)
                || string.Equals(filterValue, "Inactivo", StringComparison.OrdinalIgnoreCase))
            {
                return !row.ESTADO_COMPETENCIAS_TECNICAS.Value;
            }

            return false;
        }

        private static bool ColumnValuesMatch(string? columnValue, string filterValue, string columnName)
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
            return string.Equals(columnName, "CORR_COMPETENCIAS_TECNICAS", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsDateTimeColumn(string columnName)
        {
            return string.Equals(columnName, "FECHA_CREA", StringComparison.OrdinalIgnoreCase)
                || string.Equals(columnName, "FECHA_ACTU", StringComparison.OrdinalIgnoreCase);
        }

        private static bool DateTimeColumnValuesMatch(string? columnValue, string filterValue)
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

        private static bool TryParseFilterDateTime(string? value, out DateTime parsed)
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
            List<SC_COMPETENCIAS_TECNICASView> rows,
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

        private static object GetDistinctValue(SC_COMPETENCIAS_TECNICASView row, string columnName)
        {
            switch (columnName)
            {
                case "CORR_COMPETENCIAS_TECNICAS":
                    return row.CORR_COMPETENCIAS_TECNICAS;
                case "CODIGO_COMPETENCIAS_TECNICAS":
                    return row.CODIGO_COMPETENCIAS_TECNICAS;
                case "NOMBRE_COMPETENCIAS_TECNICAS":
                    return row.NOMBRE_COMPETENCIAS_TECNICAS;
                case "DESCRIPCION":
                    return row.DESCRIPCION;
                case "NIVEL":
                    return row.NIVEL;
                case "CODIGO_PADRE":
                    return row.CODIGO_PADRE;
                case "ESTADO_COMPETENCIAS_TECNICAS":
                    return row.ESTADO_COMPETENCIAS_TECNICAS.HasValue
                        ? row.ESTADO_COMPETENCIAS_TECNICAS.Value
                        : null;
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

        private static string GetColumnValue(SC_COMPETENCIAS_TECNICASView row, string columnName)
        {
            switch (columnName)
            {
                case "CORR_COMPETENCIAS_TECNICAS":
                    return row.CORR_COMPETENCIAS_TECNICAS.ToString();
                case "CORR_COMPETENCIAS_TECNICAS_PADRE":
                    return row.CORR_COMPETENCIAS_TECNICAS_PADRE?.ToString();
                case "CODIGO_COMPETENCIAS_TECNICAS":
                    return row.CODIGO_COMPETENCIAS_TECNICAS;
                case "NOMBRE_COMPETENCIAS_TECNICAS":
                    return row.NOMBRE_COMPETENCIAS_TECNICAS;
                case "DESCRIPCION":
                    return row.DESCRIPCION;
                case "NIVEL":
                    return row.NIVEL;
                case "ESTADO_COMPETENCIAS_TECNICAS":
                    if (!row.ESTADO_COMPETENCIAS_TECNICAS.HasValue)
                    {
                        return null;
                    }

                    return row.ESTADO_COMPETENCIAS_TECNICAS.Value ? "Activo" : "Inactivo";
                case "CODIGO_PADRE":
                    return row.CODIGO_PADRE;
                case "NOMBRE_PADRE":
                    return row.NOMBRE_PADRE;
                case "NIVEL_PADRE":
                    return row.NIVEL_PADRE;
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

        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_COMPETENCIAS_TECNICAS ?? 0;
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

        public async Task<CResult> CreateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS_PADRE", Value = Data.CORR_COMPETENCIAS_TECNICAS_PADRE, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CODIGO_COMPETENCIAS_TECNICAS", Value = Data.CODIGO_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NOMBRE_COMPETENCIAS_TECNICAS", Value = Data.NOMBRE_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NIVEL", Value = Data.NIVEL, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTADO_COMPETENCIAS_TECNICAS", Value = Data.ESTADO_COMPETENCIAS_TECNICAS ?? true, DbType = System.Data.DbType.Boolean },
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

                var reader = await objData.Insert(_TableName, p, "CORR_COMPETENCIAS_TECNICAS", pWhere);
                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_COMPETENCIAS_TECNICAS ?? 0;
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

        public async Task<CResult> UpdateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS_PADRE", Value = Data.CORR_COMPETENCIAS_TECNICAS_PADRE, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CODIGO_COMPETENCIAS_TECNICAS", Value = Data.CODIGO_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NOMBRE_COMPETENCIAS_TECNICAS", Value = Data.NOMBRE_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NIVEL", Value = Data.NIVEL, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTADO_COMPETENCIAS_TECNICAS", Value = Data.ESTADO_COMPETENCIAS_TECNICAS ?? true, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_COMPETENCIAS_TECNICAS ?? Data.CORR_COMPETENCIAS_TECNICAS;
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

        public async Task<CResult> DeleteAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32 },
                };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_COMPETENCIAS_TECNICAS;
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
                objResultado.ErrorMessage = "No se puede eliminar la competencia porque tiene registros asociados en otras tablas.";
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
                FROM V_SC_COMPETENCIAS_TECNICAS
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                AND UPPER(LTRIM(RTRIM(CODIGO_COMPETENCIAS_TECNICAS))) = UPPER(LTRIM(RTRIM(@CODIGO)))
                AND (@EXCLUDE_CORR <= 0 OR CORR_COMPETENCIAS_TECNICAS <> @EXCLUDE_CORR)";

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

        public async Task<List<SC_COMPETENCIAS_TECNICASView>> GetPadresByNivelAsync(int corrEmpresa, string nivel, bool? soloActivos)
        {
            if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(nivel))
            {
                return new List<SC_COMPETENCIAS_TECNICASView>();
            }

            const string sql = @"SELECT
                    CORR_COMPETENCIAS_TECNICAS,
                    CODIGO_COMPETENCIAS_TECNICAS,
                    NOMBRE_COMPETENCIAS_TECNICAS,
                    DESCRIPCION,
                    NIVEL,
                    ESTADO_COMPETENCIAS_TECNICAS
                FROM V_SC_COMPETENCIAS_TECNICAS
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                AND UPPER(LTRIM(RTRIM(NIVEL))) = UPPER(LTRIM(RTRIM(@NIVEL)))
                AND (@FILTRAR_ESTADO = 0 OR ESTADO_COMPETENCIAS_TECNICAS = @ESTADO)
                ORDER BY CODIGO_COMPETENCIAS_TECNICAS, CORR_COMPETENCIAS_TECNICAS";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "NIVEL", Value = nivel.Trim(), DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FILTRAR_ESTADO", Value = soloActivos.HasValue ? 1 : 0, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "ESTADO", Value = soloActivos ?? false, DbType = System.Data.DbType.Boolean },
                });

                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).ToList();
                reader.Close();
                return response;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        public async Task<List<string>> GetSiblingCodigosLevel3Async(int corrEmpresa, int corrPadre, string parentCodigoPrefix)
        {
            if (corrEmpresa <= 0 || corrPadre <= 0 || string.IsNullOrWhiteSpace(parentCodigoPrefix))
            {
                return new List<string>();
            }

            const string sql = @"SELECT CODIGO_COMPETENCIAS_TECNICAS
                FROM V_SC_COMPETENCIAS_TECNICAS
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                AND CORR_COMPETENCIAS_TECNICAS_PADRE = @CORR_PADRE
                AND UPPER(LTRIM(RTRIM(NIVEL))) = 'NIV3'
                AND CODIGO_COMPETENCIAS_TECNICAS LIKE @CODIGO_PREFIX + '%'";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_PADRE", Value = corrPadre, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CODIGO_PREFIX", Value = parentCodigoPrefix.Trim(), DbType = System.Data.DbType.String },
                });

                var codigos = new List<string>();
                while (reader.Read())
                {
                    codigos.Add(reader["CODIGO_COMPETENCIAS_TECNICAS"]?.ToString() ?? string.Empty);
                }

                reader.Close();
                return codigos;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        public async Task<bool> HasChildrenAsync(int corrEmpresa, int corrCompetencia)
        {
            if (corrEmpresa <= 0 || corrCompetencia <= 0)
            {
                return false;
            }

            const string sql = @"SELECT TOP 1 1 AS FOUND
                FROM V_SC_COMPETENCIAS_TECNICAS
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                AND CORR_COMPETENCIAS_TECNICAS_PADRE = @CORR_COMPETENCIAS_TECNICAS";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = corrCompetencia, DbType = System.Data.DbType.Int32 },
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
