using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_GERENCIAService : IGEN_GERENCIAService
	{
		private readonly IGEN_GERENCIARepository _repo;

		public GEN_GERENCIAService(IGEN_GERENCIARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_GERENCIAParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		public async Task<CResult> GetDistinctValuesAsync(GEN_GERENCIAParam xWhere)
		{
			if (string.IsNullOrWhiteSpace(xWhere.DISTINCT_FIELD))
			{
				return ValidationError("Debe indicar el campo para el filtro de encabezado.");
			}

			return await _repo.GetDistinctValuesAsync(BuildParameters(xWhere));
		}

		public async Task<CResult> GetAsync(GEN_GERENCIAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_GERENCIA", Value = xWhere.CORR_GERENCIA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validation = Validate(Data);
			if (validation != null) return validation;

			Data.NOMBRE_GERENCIA = Data.NOMBRE_GERENCIA.Trim();
			Data.CODIGO_GERENCIA = Data.CODIGO_GERENCIA.Trim();

			var duplicate = await ValidateUniqueCodigoAsync(Data, null);
			if (duplicate != null) return duplicate;

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validation = Validate(Data);
			if (validation != null) return validation;

			Data.NOMBRE_GERENCIA = Data.NOMBRE_GERENCIA.Trim();
			Data.CODIGO_GERENCIA = Data.CODIGO_GERENCIA.Trim();

			var duplicate = await ValidateUniqueCodigoAsync(Data, Data.CORR_GERENCIA);
			if (duplicate != null) return duplicate;

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static List<CParameter> BuildParameters(GEN_GERENCIAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
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

		private static CResult Validate(GEN_GERENCIATable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos de gerencia.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_GERENCIA))
			{
				return ValidationError("Debe ingresar el nombre de gerencia.");
			}

			if (Data.NOMBRE_GERENCIA.Trim().Length > 100)
			{
				return ValidationError("El nombre de gerencia no puede superar 100 caracteres.");
			}

			if (string.IsNullOrWhiteSpace(Data.CODIGO_GERENCIA))
			{
				return ValidationError("Debe ingresar el codigo de gerencia.");
			}

			if (Data.CODIGO_GERENCIA.Trim().Length > 10)
			{
				return ValidationError("El codigo de gerencia no puede superar 10 caracteres.");
			}

			if (!Data.CORR_DIVISION.HasValue || Data.CORR_DIVISION.Value <= 0)
			{
				return ValidationError("Debe seleccionar la division.");
			}

			return null;
		}

		private async Task<CResult> ValidateUniqueCodigoAsync(GEN_GERENCIATable Data, int? excludeCorr)
		{
			var exists = await _repo.ExistsCodigoAsync(
				Data.CORR_EMPRESA,
				Data.CODIGO_GERENCIA,
				excludeCorr ?? 0);

			return exists
				? ValidationError($"Ya existe una gerencia con el codigo {Data.CODIGO_GERENCIA}.")
				: null;
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
				ErrorSource = "[GEN_GERENCIAService]",
				RowsAffected = 0
			};
		}
	}
}
