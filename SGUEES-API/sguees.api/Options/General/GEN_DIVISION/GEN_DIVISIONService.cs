using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_DIVISIONService : IGEN_DIVISIONService
	{
		private readonly IGEN_DIVISIONRepository _repo;

		public GEN_DIVISIONService(IGEN_DIVISIONRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_DIVISIONParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		public async Task<CResult> GetDistinctValuesAsync(GEN_DIVISIONParam xWhere)
		{
			if (string.IsNullOrWhiteSpace(xWhere.DISTINCT_FIELD))
			{
				return ValidationError("Debe indicar el campo para el filtro de encabezado.");
			}

			return await _repo.GetDistinctValuesAsync(BuildParameters(xWhere));
		}

		public async Task<CResult> GetDivisionesAsync(GEN_DIVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetDivisionesAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_DIVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DIVISION", Value = xWhere.CORR_DIVISION, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validation = Validate(Data);
			if (validation != null) return validation;

			Data.NOMBRE_DIVISION = Data.NOMBRE_DIVISION.Trim();
			Data.CODIGO_DIVISION = Data.CODIGO_DIVISION.Trim();

			var duplicate = await ValidateUniqueCodigoAsync(Data, null);
			if (duplicate != null) return duplicate;

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validation = Validate(Data);
			if (validation != null) return validation;

			Data.NOMBRE_DIVISION = Data.NOMBRE_DIVISION.Trim();
			Data.CODIGO_DIVISION = Data.CODIGO_DIVISION.Trim();

			var duplicate = await ValidateUniqueCodigoAsync(Data, Data.CORR_DIVISION);
			if (duplicate != null) return duplicate;

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static List<CParameter> BuildParameters(GEN_DIVISIONParam xWhere)
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

		private static CResult Validate(GEN_DIVISIONTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos de division.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_DIVISION))
			{
				return ValidationError("Debe ingresar el nombre de division.");
			}

			if (Data.NOMBRE_DIVISION.Trim().Length > 100)
			{
				return ValidationError("El nombre de division no puede superar 100 caracteres.");
			}

			if (string.IsNullOrWhiteSpace(Data.CODIGO_DIVISION))
			{
				return ValidationError("Debe ingresar el codigo de division.");
			}

			if (Data.CODIGO_DIVISION.Trim().Length > 10)
			{
				return ValidationError("El codigo de division no puede superar 10 caracteres.");
			}

			return null;
		}

		private async Task<CResult> ValidateUniqueCodigoAsync(GEN_DIVISIONTable Data, int? excludeCorr)
		{
			var exists = await _repo.ExistsCodigoAsync(
				Data.CORR_EMPRESA,
				Data.CODIGO_DIVISION,
				excludeCorr ?? 0);

			return exists
				? ValidationError($"Ya existe una division con el codigo {Data.CODIGO_DIVISION}.")
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
				ErrorSource = "[GEN_DIVISIONService]",
				RowsAffected = 0
			};
		}
	}
}
