using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class PLA_TIPO_PUESTOService : IPLA_TIPO_PUESTOService
    {
        private readonly IPLA_TIPO_PUESTORepository _repo;

        public PLA_TIPO_PUESTOService(IPLA_TIPO_PUESTORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(PLA_TIPO_PUESTOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetDistinctValuesAsync(PLA_TIPO_PUESTOParam xWhere)
        {
            if (string.IsNullOrWhiteSpace(xWhere.DISTINCT_FIELD))
            {
                return ValidationError("Debe indicar el campo para el filtro de encabezado.");
            }

            return await _repo.GetDistinctValuesAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(PLA_TIPO_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_TIPO_PUESTO", Value = xWhere.CORR_TIPO_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            Data.NOMBRE_TIPO_PUESTO = Data.NOMBRE_TIPO_PUESTO.Trim();
            Data.ESTADO_TIPO_PUESTO ??= true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            Data.NOMBRE_TIPO_PUESTO = Data.NOMBRE_TIPO_PUESTO.Trim();
            Data.ESTADO_TIPO_PUESTO ??= true;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DesactivarAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            Data.ESTADO_TIPO_PUESTO = false;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static List<CParameter> BuildParameters(PLA_TIPO_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTADO_TIPO_PUESTO", Value = xWhere.ESTADO_TIPO_PUESTO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "PAGE", Value = xWhere.PAGE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "DISTINCT_FIELD", Value = xWhere.DISTINCT_FIELD, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "HEADER_FILTER_SEARCH", Value = xWhere.HEADER_FILTER_SEARCH, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "SORT_FIELD", Value = xWhere.SORT_FIELD, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "SORT_DESC", Value = xWhere.SORT_DESC, DbType = System.Data.DbType.Boolean },
            };

            AddJsonParameter(p, "FILTER_ROW_JSON", xWhere.FILTER_ROW_JSON);
            AddJsonParameter(p, "COLUMN_EXACT_JSON", xWhere.COLUMN_EXACT_JSON);
            AddJsonParameter(p, "COLUMN_ANYOF_JSON", xWhere.COLUMN_ANYOF_JSON);
            AddAnyOfFilters(p, xWhere.COLUMN_ANYOF_JSON);

            return p;
        }

        private static void AddJsonParameter(List<CParameter> p, string parameterName, string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return;
            }

            p.Add(new CParameter()
            {
                ParameterName = parameterName,
                Value = json,
                DbType = System.Data.DbType.String,
            });
        }

        private static void AddAnyOfFilters(List<CParameter> p, string columnAnyOfJson)
        {
            if (string.IsNullOrWhiteSpace(columnAnyOfJson))
            {
                return;
            }

            try
            {
                var filters = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(columnAnyOfJson);
                if (filters == null)
                {
                    return;
                }

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

                    if (values.Count == 0)
                    {
                        continue;
                    }

                    p.Add(new CParameter()
                    {
                        ParameterName = $"{filter.Key}_ANYOF",
                        Value = string.Join('|', values),
                        DbType = System.Data.DbType.String,
                    });
                }
            }
            catch (JsonException)
            {
            }
        }

        private static CResult Validate(PLA_TIPO_PUESTOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del tipo de puesto.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_TIPO_PUESTO))
            {
                return ValidationError("Debe ingresar el nombre del tipo de puesto.");
            }

            if (Data.NOMBRE_TIPO_PUESTO.Trim().Length > 100)
            {
                return ValidationError("El nombre del tipo de puesto no puede superar 100 caracteres.");
            }

            return null;
        }

        private static CResult ValidationError(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = message,
                ErrorSource = "[PLA_TIPO_PUESTOService]",
                RowsAffected = 0
            };
        }
    }
}
