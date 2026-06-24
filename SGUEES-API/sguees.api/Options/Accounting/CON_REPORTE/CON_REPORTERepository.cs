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
	public class CON_REPORTERepository : ICON_REPORTERepository
	{
		private readonly CData _data;

		public CON_REPORTERepository(IConfiguration config)
		{
			_data = new CData(
				config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value);
		}

		public Task<CResult> GetDefinicionesAsync()
		{
			var result = new CResult
			{
				Result = true,
				Data = CON_REPORTERegistry.GetAll(),
				RowsAffected = CON_REPORTERegistry.GetAll().Count,
			};
			return Task.FromResult(result);
		}

		public async Task<CResult> GetConfiReportesAsync(int corrEmpresa)
		{
			var result = new CResult();
			try
			{
				var where = new List<CParameter>
				{
					new CParameter { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
				};
				var reader = await _data.GetDataReader("V_CON_CONFI_REPORTE", where);
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

		public async Task<CResult> ConsultarAsync(CON_REPORTEParam param)
		{
			var result = new CResult();
			if (!CON_REPORTERegistry.TryGet(param.CODIGO_REPORTE, out var definition))
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
				result.ErrorMessage = $"El procedimiento {definition.Sp} aun no esta disponible en SGUEES-DB.";
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

		public async Task<CResult> ConsultarParaImprAsync(CON_REPORTEParam param)
		{
			var result = new CResult();
			if (!CON_REPORTERegistry.TryGet(param.CODIGO_REPORTE, out var definition))
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
				result.ErrorMessage = $"El procedimiento {definition.Sp} aun no esta disponible en SGUEES-DB.";
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

		private static List<Dictionary<string, object>> ReadRows(DbDataReader reader)
		{
			var rows = new List<Dictionary<string, object>>();
			while (reader.Read())
			{
				var row = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
				for (var i = 0; i < reader.FieldCount; i++)
				{
					var value = reader.IsDBNull(i) ? null : reader.GetValue(i);
					row[reader.GetName(i)] = value;
				}
				rows.Add(row);
			}
			return rows;
		}

		private static List<CParameter> BuildParameters(string codigo, CON_REPORTEParam param)
		{
			var p = new List<CParameter>
			{
				P("CORR_EMPRESA", param.CORR_EMPRESA, DbType.Int32),
			};

			switch (codigo?.Trim().ToUpperInvariant())
			{
				case "LIBRO_DIARIO_AUXILIAR":
				case "LIBRO_DIARIO_AUXILIAR_MES":
					p.Add(P("FECHA_INICIAL", param.FECHA_INICIAL ?? new DateTime(DateTime.Today.Year, 1, 1), DbType.Date));
					p.Add(P("FECHA_FINAL", param.FECHA_FINAL ?? DateTime.Today, DbType.Date));
					p.Add(P("CUENTA_CONTABLE_INICIAL", param.CUENTA_CONTABLE_INICIAL ?? string.Empty, DbType.String));
					p.Add(P("CUENTA_CONTABLE_FINAL", param.CUENTA_CONTABLE_FINAL ?? string.Empty, DbType.String));
					p.Add(P("PARTIDA_CIERRE", param.PARTIDA_CIERRE ?? false, DbType.Boolean));
					p.Add(P("PARTIDA_LIQUIDACION", param.PARTIDA_LIQUIDACION ?? false, DbType.Boolean));
					p.Add(P("CUENTA_A_CERO", param.CUENTA_A_CERO ?? false, DbType.Boolean));
					p.Add(P("CORR_CONFI_REPORTE", param.CORR_CONFI_REPORTE, DbType.Int32));
					p.Add(P("CONSOLIDADO", param.CONSOLIDADO ?? false, DbType.Boolean));
					p.Add(P("CORR_MONEDA", param.CORR_MONEDA, DbType.Int32));
					p.Add(P("FOLIADO", param.FOLIADO ?? false, DbType.Boolean));
					p.Add(P("NUMERO_FOLIO", param.NUMERO_FOLIO ?? 0, DbType.Int32));
					p.Add(P("CUENTA_ESPECIFICA", param.CUENTA_ESPECIFICA ?? string.Empty, DbType.String));
					break;

				case "LIBRO_DIARIO_MAYOR":
					p.Add(P("FECHA_INICIAL", param.FECHA_INICIAL ?? new DateTime(DateTime.Today.Year, 1, 1), DbType.Date));
					p.Add(P("FECHA_FINAL", param.FECHA_FINAL ?? DateTime.Today, DbType.Date));
					p.Add(P("CUENTA_CONTABLE_INICIAL", param.CUENTA_CONTABLE_INICIAL ?? string.Empty, DbType.String));
					p.Add(P("CUENTA_CONTABLE_FINAL", param.CUENTA_CONTABLE_FINAL ?? string.Empty, DbType.String));
					p.Add(P("PARTIDA_CIERRE", param.PARTIDA_CIERRE ?? false, DbType.Boolean));
					p.Add(P("PARTIDA_LIQUIDACION", param.PARTIDA_LIQUIDACION ?? false, DbType.Boolean));
					p.Add(P("CUENTA_A_CERO", param.CUENTA_A_CERO ?? false, DbType.Boolean));
					p.Add(P("CORR_MONEDA", param.CORR_MONEDA, DbType.Int32));
					p.Add(P("FECHA_IMPRESION", param.FECHA_IMPRESION ?? DateTime.Today, DbType.Date));
					p.Add(P("FOLIADO", param.FOLIADO ?? false, DbType.Boolean));
					p.Add(P("NUMERO_FOLIO", param.NUMERO_FOLIO ?? 0, DbType.Int32));
					break;

				case "BALANCE_COMPROBACION":
				case "BALANCE_COMPROBACION_MES":
				case "BALANCE_GENERAL":
				case "ESTADO_RESULTADOS":
				case "BALANCE_GENERAL_VERTICAL":
					p.Add(P("FECHA_FINAL", param.FECHA_FINAL ?? DateTime.Today, DbType.Date));
					p.Add(P("NIVEL", param.NIVEL ?? 3, DbType.Int16));
					p.Add(P("PARTIDA_CIERRE", param.PARTIDA_CIERRE ?? false, DbType.Boolean));
					p.Add(P("PARTIDA_LIQUIDACION", param.PARTIDA_LIQUIDACION ?? false, DbType.Boolean));
					p.Add(P("CORR_MONEDA", param.CORR_MONEDA, DbType.Int32));
					p.Add(P("FOLIADO", param.FOLIADO ?? false, DbType.Boolean));
					p.Add(P("NUMERO_FOLIO", param.NUMERO_FOLIO ?? 0, DbType.Int32));
					if (codigo == "BALANCE_COMPROBACION" || codigo == "BALANCE_COMPROBACION_MES")
					{
						p.Add(P("CUENTA_A_CERO", param.CUENTA_A_CERO ?? false, DbType.Boolean));
					}
					if (codigo == "BALANCE_GENERAL_VERTICAL")
					{
						p.Add(P("MUESTRA_FIRMA", param.MUESTRA_FIRMA ?? false, DbType.Boolean));
					}
					break;
			}

			return p;
		}

		private static CParameter P(string name, object value, DbType type) =>
			new CParameter { ParameterName = name, Value = value ?? DBNull.Value, DbType = type };
	}
}
