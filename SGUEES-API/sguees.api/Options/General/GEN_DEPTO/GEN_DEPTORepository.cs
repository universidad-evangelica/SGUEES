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
	// Qué hace: ejecuta el CRUD y las consultas SQL sobre GEN_DEPTO y V_GEN_DEPTO.
	public class GEN_DEPTORepository : BaseRepository<GEN_DEPTOTable>, IGEN_DEPTORepository
	{
		private const string _TableName = "GEN_DEPTO";
		private const string _ViewName = "V_GEN_DEPTO";

		// Qué hace: configura conexión y proveedor desde appsettings.
		public GEN_DEPTORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Qué hace: lista departamentos desde la vista.
		// Cómo: GetDataReader sobre la vista y ordena el resultado.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var dbWhere = xWhere
					.Where(x => x.ParameterName == "CORR_PAIS")
					.ToList();

				var reader = await objData.GetDataReader(_ViewName, dbWhere);
				var response = new List<GEN_DEPTOView>().FromDataReader(reader)
					.OrderBy(x => x.CORR_DEPTO)
					.ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
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

		// Qué hace: obtiene departamento por claves.
		// Cómo: GetDataReader y FirstOrDefault.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_DEPTOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_DEPTO ?? 0;
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

		// Qué hace: inserta departamento.
		// Cómo: Insert sobre la tabla y mapea clave duplicada.
		public async Task<CResult> CreateAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "NOMBRE_DEPTO", Value = data.NOMBRE_DEPTO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_DEPTO", Value = data.CODIGO_DEPTO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, "CORR_DEPTO", pWhere);
				var response = new List<GEN_DEPTOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_DEPTO ?? 0;
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

		// Qué hace: actualiza departamento.
		// Cómo: Update sobre la tabla con las claves.
		public async Task<CResult> UpdateAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "NOMBRE_DEPTO", Value = data.NOMBRE_DEPTO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_DEPTO", Value = data.CODIGO_DEPTO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<GEN_DEPTOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_DEPTO ?? data.CORR_DEPTO;
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

		// Qué hace: elimina departamento.
		// Cómo: Delete sobre la tabla; captura FK como mensaje controlado.
		public async Task<CResult> DeleteAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = data.CORR_DEPTO;
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
				objResultado.ErrorMessage = "No se puede eliminar el departamento porque tiene registros asociados en otras tablas.";
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: comprueba si ya existe un departamento con el mismo valor.
		// Cómo: consulta dinámica excluyendo el correlativo en edición.
		public async Task<bool> ExistsDeptoByFieldAsync(int corrPais, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto)
		{
			if (!IsAllowedDeptoField(fieldName) || string.IsNullOrWhiteSpace(normalizedValue))
			{
				return false;
			}

			var excludeClause = excludeCorrPais > 0 && excludeCorrDepto > 0
				? " AND NOT (CORR_PAIS = @EXCLUDE_CORR_PAIS AND CORR_DEPTO = @EXCLUDE_CORR_DEPTO)"
				: string.Empty;

			var sql = $@"SELECT TOP 1 1 AS FOUND
				FROM {_ViewName}
				WHERE CORR_PAIS = @CORR_PAIS
				AND UPPER(LTRIM(RTRIM({fieldName}))) = @NORMALIZED_VALUE{excludeClause}";

			var parameters = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = corrPais, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "NORMALIZED_VALUE", Value = normalizedValue, DbType = System.Data.DbType.String },
			};

			if (excludeCorrPais > 0 && excludeCorrDepto > 0)
			{
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_PAIS", Value = excludeCorrPais, DbType = System.Data.DbType.Int32 });
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_DEPTO", Value = excludeCorrDepto, DbType = System.Data.DbType.Int32 });
			}

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, parameters);
				var exists = reader.Read();
				reader.Close();
				return exists;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		// Qué hace: restringe los campos del departamento en consultas de duplicados.
		private static bool IsAllowedDeptoField(string fieldName) =>
			fieldName is "NOMBRE_DEPTO" or "CODIGO_DEPTO";

		// Qué hace: detecta errores de clave duplicada de SQL Server.
		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
		}
	}
}
