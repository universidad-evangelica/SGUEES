using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IBAN_REPORTERepository
	{
		Task<CResult> GetDefinicionesAsync();
		Task<CResult> ConsultarAsync(BAN_REPORTEParam param);
		Task<CResult> ConsultarParaImprAsync(BAN_REPORTEParam param);
	}

	public class BAN_REPORTERepository : IBAN_REPORTERepository
	{
		private readonly CData _data;

		public BAN_REPORTERepository(IConfiguration config)
		{
			_data = new CData(
				config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value);
		}

		public Task<CResult> GetDefinicionesAsync()
		{
			return Task.FromResult(new CResult
			{
				Result = true,
				Data = BAN_REPORTERegistry.GetAll(),
				RowsAffected = BAN_REPORTERegistry.GetAll().Count,
			});
		}

		public async Task<CResult> ConsultarAsync(BAN_REPORTEParam param)
		{
			var result = new CResult();
			if (!BAN_REPORTERegistry.TryGet(param.CODIGO_REPORTE, out var definition))
			{
				result.Result = false;
				result.ErrorCode = -1;
				result.ErrorMessage = $"Reporte no registrado: {param.CODIGO_REPORTE}";
				return result;
			}

			if (!definition.SpDisponible)
			{
				result.Result = false;
				result.ErrorCode = -1;
				result.ErrorMessage = $"El procedimiento {definition.Sp} aún no está disponible en SGUEES-DB.";
				return result;
			}

			try
			{
				var spParams = BuildParameters(param.CODIGO_REPORTE, param);
				var reader = await _data.GetDataReader(CommandType.StoredProcedure, definition.Sp, spParams);
				var rows = ReadRows(reader);
				reader.Close();
				result.Result = true;
				result.Data = rows;
				result.RowsAffected = rows.Count;
			}
			catch (Exception e)
			{
				result.Result = false;
				result.ErrorCode = -1;
				result.ErrorMessage = e.Message;
				result.ErrorSource = e.Source;
			}
			finally
			{
				_data.objConnection.Close();
			}

			return result;
		}

		public async Task<CResult> ConsultarParaImprAsync(BAN_REPORTEParam param)
		{
			var result = new CResult();
			if (!BAN_REPORTERegistry.TryGet(param.CODIGO_REPORTE, out var definition))
			{
				result.Result = false;
				result.ErrorCode = -1;
				result.ErrorMessage = $"Reporte no registrado: {param.CODIGO_REPORTE}";
				return result;
			}

			if (!definition.SpDisponible)
			{
				result.Result = false;
				result.ErrorCode = -1;
				result.ErrorMessage = $"El procedimiento {definition.Sp} aún no está disponible en SGUEES-DB.";
				return result;
			}

			if (string.IsNullOrWhiteSpace(definition.RptFile))
			{
				result.Result = false;
				result.ErrorCode = -1;
				result.ErrorMessage = $"No hay archivo Crystal registrado para {param.CODIGO_REPORTE}.";
				return result;
			}

			try
			{
				var spParams = BuildParameters(param.CODIGO_REPORTE, param);
				var reader = await _data.GetDataReader(CommandType.StoredProcedure, definition.Sp, spParams);
				var rows = ReadRowsWithHeader(reader);
				reader.Close();
				EnrichPrintRows(param.CODIGO_REPORTE, param, definition, rows);
				result.Result = true;
				result.Data = BanReportImprFactory.ToImprViews(param.CODIGO_REPORTE, rows);
				result.RowsAffected = rows.Count;
			}
			catch (Exception e)
			{
				result.Result = false;
				result.ErrorCode = -1;
				result.ErrorMessage = e.Message;
				result.ErrorSource = e.Source;
			}
			finally
			{
				_data.objConnection.Close();
			}

			return result;
		}

		private static List<Dictionary<string, object>> ReadRowsWithHeader(DbDataReader reader)
		{
			var detail = ReadRows(reader);
			if (!reader.NextResult())
			{
				return detail;
			}

			Dictionary<string, object> header = null;
			if (reader.Read())
			{
				header = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
				for (var i = 0; i < reader.FieldCount; i++)
				{
					header[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
				}
			}

			if (header == null || detail.Count == 0)
			{
				return detail;
			}

			foreach (var row in detail)
			{
				foreach (var item in header)
				{
					if (!row.ContainsKey(item.Key))
					{
						row[item.Key] = item.Value;
					}
				}
			}

			return detail;
		}

		private static void EnrichPrintRows(
			string codigo,
			BAN_REPORTEParam param,
			(string Sp, string Titulo, string Destino, int Oleada, bool SpDisponible, string RptFile, string UrlOpcion, string[] Filtros) definition,
			List<Dictionary<string, object>> rows)
		{
			if (rows == null || rows.Count == 0)
			{
				return;
			}

			var periodo = BuildPeriodo(param);
			var fechaImpresion = param.FECHA_IMPRESION ?? DateTime.Now;

			foreach (var row in rows)
			{
				SetIfEmpty(row, "PERIODO", periodo);
				SetIfEmpty(row, "TITULO_REPORTE", definition.Titulo);
				SetIfEmpty(row, "NOMBRE_SISTEMA", "SGUEES");
				SetIfMissing(row, "FECHA_IMPRESION", fechaImpresion);
			}
		}

		private static string BuildPeriodo(BAN_REPORTEParam param)
		{
			if (param.FECHA_INICIAL.HasValue && param.FECHA_FINAL.HasValue)
			{
				return $"{param.FECHA_INICIAL.Value:dd/MM/yyyy} - {param.FECHA_FINAL.Value:dd/MM/yyyy}";
			}

			if (param.FECHA_FINAL.HasValue)
			{
				return param.FECHA_FINAL.Value.ToString("dd/MM/yyyy");
			}

			return string.Empty;
		}

		private static void SetIfMissing(Dictionary<string, object> row, string key, object value)
		{
			if (!ContainsKeyIgnoreCase(row, key))
			{
				row[key] = value;
			}
		}

		private static void SetIfEmpty(Dictionary<string, object> row, string key, string value)
		{
			if (!ContainsKeyIgnoreCase(row, key) || string.IsNullOrWhiteSpace(Convert.ToString(GetValueIgnoreCase(row, key))))
			{
				row[key] = value ?? string.Empty;
			}
		}

		private static bool ContainsKeyIgnoreCase(Dictionary<string, object> row, string key)
		{
			foreach (var item in row)
			{
				if (string.Equals(item.Key, key, StringComparison.OrdinalIgnoreCase))
				{
					return true;
				}
			}

			return false;
		}

		private static object GetValueIgnoreCase(Dictionary<string, object> row, string key)
		{
			foreach (var item in row)
			{
				if (string.Equals(item.Key, key, StringComparison.OrdinalIgnoreCase))
				{
					return item.Value;
				}
			}

			return null;
		}

		private static List<CParameter> BuildParameters(string codigo, BAN_REPORTEParam param)
		{
			switch (codigo?.Trim().ToUpperInvariant())
			{
				case "BAN_CHEQUE_EMITIDOS":
					return new List<CParameter>
					{
						P("CORR_EMPRESA", param.CORR_EMPRESA, DbType.Int32),
						P("FECHA_INICIAL", param.FECHA_INICIAL ?? DateTime.Today, DbType.Date),
						P("FECHA_FINAL", param.FECHA_FINAL ?? DateTime.Today, DbType.Date),
						P("CORR_CUENTA_BANCO", param.CORR_CUENTA_BANCO ?? 0, DbType.Int32),
						P("NUMERO_DOCUMENTO_INICIAL", param.NUMERO_DOCUMENTO_INICIAL ?? 0, DbType.Int32),
						P("NUMERO_DOCUMENTO_FINAL", param.NUMERO_DOCUMENTO_FINAL ?? 0, DbType.Int32),
					};
				case "BAN_ESTADO_CUENTA":
				case "BAN_ESTADO_CUENTA_ACUMULADO":
					return new List<CParameter>
					{
						P("CORR_EMPRESAS", param.CORR_EMPRESA.ToString(), DbType.String),
						P("FECHA_INICIAL", param.FECHA_INICIAL ?? DateTime.Today, DbType.Date),
						P("FECHA_FINAL", param.FECHA_FINAL ?? DateTime.Today, DbType.Date),
						P("CORR_CUENTA_BANCO", NullInt(param.CORR_CUENTA_BANCO), DbType.Int32),
						P("CORR_TIPO_MOVIMIENTO", NullInt(param.CORR_TIPO_MOVIMIENTO), DbType.Int32),
						P("OPCION_CONSULTA", 0, DbType.Int32),
					};
				case "BAN_ENTREGA_CHEQUES":
					return new List<CParameter>
					{
						P("CORR_EMPRESA", param.CORR_EMPRESA, DbType.Int32),
						P("FECHA_INICIAL", param.FECHA_INICIAL ?? DateTime.Today, DbType.Date),
						P("FECHA_FINAL", param.FECHA_FINAL ?? DateTime.Today, DbType.Date),
					};
				default:
					return new List<CParameter>
					{
						P("CORR_EMPRESA", param.CORR_EMPRESA, DbType.Int32),
					};
			}
		}

		private static object NullInt(int? value) =>
			!value.HasValue || value.Value == 0 ? DBNull.Value : value.Value;

		private static List<Dictionary<string, object>> ReadRows(DbDataReader reader)
		{
			var rows = new List<Dictionary<string, object>>();
			while (reader.Read())
			{
				var row = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
				for (var i = 0; i < reader.FieldCount; i++)
				{
					row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
				}
				rows.Add(row);
			}

			return rows;
		}

		private static CParameter P(string name, object value, DbType type) =>
			new() { ParameterName = name, Value = value ?? DBNull.Value, DbType = type };
	}
}
