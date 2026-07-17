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
	// Acceso a datos de GEN_DISTRITO / V_GEN_DISTRITO: CRUD y comprobación de duplicados.
	public class GEN_DISTRITORepository : BaseRepository<GEN_DISTRITOTable>, IGEN_DISTRITORepository
	{
		private const string _TableName = "GEN_DISTRITO";
		private const string _ViewName = "V_GEN_DISTRITO";

		// Configura la conexión y el proveedor de BD desde appsettings.
		public GEN_DISTRITORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Consulta la vista de distritos aplicando el contexto de empresa y devuelve el listado ordenado.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var dbWhere = xWhere.Where(x => x.ParameterName is "CORR_PAIS" or "CORR_DEPTO" or "CORR_MUNICIPIO").ToList();
				var reader = await objData.GetDataReader(_ViewName, dbWhere);
				var response = new List<GEN_DISTRITOView>().FromDataReader(reader)
					.OrderBy(x => x.CORR_DISTRITO)
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

		// Consulta un distrito por sus claves y devuelve el primer registro coincidente.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_DISTRITOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_DISTRITO ?? 0;
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

		// Inserta el distrito, recupera el registro creado y normaliza errores de clave duplicada.
		public async Task<CResult> CreateAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DISTRITO", Value = data.CORR_DISTRITO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "NOMBRE_DISTRITO", Value = data.NOMBRE_DISTRITO, DbType = System.Data.DbType.String },
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
					new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, "CORR_DISTRITO", pWhere);
				var response = new List<GEN_DISTRITOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_DISTRITO ?? 0;
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

		// Actualiza el distrito por sus claves y devuelve el registro resultante.
		public async Task<CResult> UpdateAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "NOMBRE_DISTRITO", Value = data.NOMBRE_DISTRITO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DISTRITO", Value = data.CORR_DISTRITO, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<GEN_DISTRITOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = data.CORR_DISTRITO;
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

		// Elimina el distrito por sus claves y convierte restricciones relacionadas en un resultado controlado.
		public async Task<CResult> DeleteAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DISTRITO", Value = data.CORR_DISTRITO, DbType = System.Data.DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = data.CORR_DISTRITO;
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
				objResultado.ErrorMessage = "No se puede eliminar el distrito porque tiene registros asociados en otras tablas.";
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Comprueba si ya existe un distrito con el valor normalizado, excluyendo el registro en edición.
		public Task<bool> ExistsDistritoByFieldAsync(int corrPais, int corrDepto, int corrMunicipio, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto, int excludeCorrMunicipio, int excludeCorrDistrito)
		{
			if (!IsAllowedDistritoField(fieldName) || string.IsNullOrWhiteSpace(normalizedValue))
			{
				return Task.FromResult(false);
			}

			var excludeClause = excludeCorrPais > 0 && excludeCorrDepto > 0 && excludeCorrMunicipio > 0 && excludeCorrDistrito > 0
				? " AND NOT (CORR_PAIS = @EXCLUDE_CORR_PAIS AND CORR_DEPTO = @EXCLUDE_CORR_DEPTO AND CORR_MUNICIPIO = @EXCLUDE_CORR_MUNICIPIO AND CORR_DISTRITO = @EXCLUDE_CORR_DISTRITO)"
				: string.Empty;

			var sql = $@"SELECT TOP 1 1 AS FOUND
				FROM {_ViewName}
				WHERE CORR_PAIS = @CORR_PAIS
				AND CORR_DEPTO = @CORR_DEPTO
				AND CORR_MUNICIPIO = @CORR_MUNICIPIO
				AND UPPER(LTRIM(RTRIM({fieldName}))) = @NORMALIZED_VALUE{excludeClause}";

			var parameters = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = corrPais, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = corrDepto, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = corrMunicipio, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "NORMALIZED_VALUE", Value = normalizedValue, DbType = System.Data.DbType.String },
			};

			if (excludeCorrPais > 0 && excludeCorrDepto > 0 && excludeCorrMunicipio > 0 && excludeCorrDistrito > 0)
			{
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_PAIS", Value = excludeCorrPais, DbType = System.Data.DbType.Int32 });
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_DEPTO", Value = excludeCorrDepto, DbType = System.Data.DbType.Int32 });
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_MUNICIPIO", Value = excludeCorrMunicipio, DbType = System.Data.DbType.Int32 });
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_DISTRITO", Value = excludeCorrDistrito, DbType = System.Data.DbType.Int32 });
			}

			return ExistsByQueryAsync(sql, parameters);
		}

		// Ejecuta la consulta de existencia y garantiza el cierre de la conexión utilizada.
		private async Task<bool> ExistsByQueryAsync(string sql, List<CParameter> parameters)
		{
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

		// Restringe los campos del distrito permitidos en la consulta dinámica de duplicados.
		private static bool IsAllowedDistritoField(string fieldName) =>
			fieldName is "NOMBRE_DISTRITO";

		// Reconoce excepciones de claves únicas para devolver un mensaje funcional en lugar del error técnico.
		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
		}
	}
}
