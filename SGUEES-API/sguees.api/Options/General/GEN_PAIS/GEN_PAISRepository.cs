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
	// Acceso a datos de GEN_PAIS / V_GEN_PAIS: CRUD y comprobación de duplicados.
	public class GEN_PAISRepository : BaseRepository<GEN_PAISTable>, IGEN_PAISRepository
	{
		private const string _TableName = "GEN_PAIS";
		private const string _ViewName = "V_GEN_PAIS";
		private const string _CampoPk = "CORR_PAIS";

		// Configura la conexión y el proveedor de BD desde appsettings.
		public GEN_PAISRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Consulta la vista de países aplicando el contexto de empresa y devuelve el listado ordenado.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(_ViewName, new List<CParameter>());
				var response = new List<GEN_PAISView>().FromDataReader(reader)
					.OrderBy(x => x.CORR_PAIS)
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

		// Consulta un país por sus claves y devuelve el primer registro coincidente.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_PAISView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_PAIS ?? 0;
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

		// Inserta el país, recupera el registro creado y normaliza errores de clave duplicada.
		public async Task<CResult> CreateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PAIS", Value = Data.CORR_PAIS, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "NOMBRE_PAIS", Value = Data.NOMBRE_PAIS, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_PAIS", Value = Data.CODIGO_PAIS, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "NACIONALIDAD", Value = Data.NACIONALIDAD, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "NOMBRE_CORTO", Value = Data.NOMBRE_CORTO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var reader = await objData.Insert(_TableName, p, _CampoPk, new List<CParameter>());
				var response = new List<GEN_PAISView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_PAIS ?? 0;
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

		// Actualiza el país por sus claves y devuelve el registro resultante.
		public async Task<CResult> UpdateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "NOMBRE_PAIS", Value = Data.NOMBRE_PAIS, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_PAIS", Value = Data.CODIGO_PAIS, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "NACIONALIDAD", Value = Data.NACIONALIDAD, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "NOMBRE_CORTO", Value = Data.NOMBRE_CORTO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PAIS", Value = Data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<GEN_PAISView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_PAIS ?? Data.CORR_PAIS;
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

		// Elimina el país por sus claves y convierte restricciones relacionadas en un resultado controlado.
		public async Task<CResult> DeleteAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PAIS", Value = Data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_PAIS;
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
				objResultado.ErrorMessage = "No se puede eliminar el país porque tiene registros asociados en otras tablas.";
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Comprueba si ya existe un país con el valor normalizado, excluyendo el registro en edición.
		public async Task<bool> ExistsByFieldAsync(string fieldName, string normalizedValue, int excludeCorrPais)
		{
			if (!IsAllowedField(fieldName) || string.IsNullOrWhiteSpace(normalizedValue))
			{
				return false;
			}

			var sql = $@"SELECT TOP 1 1 AS FOUND
				FROM {_ViewName}
				WHERE UPPER(LTRIM(RTRIM({fieldName}))) = @NORMALIZED_VALUE
				AND (@EXCLUDE_CORR_PAIS <= 0 OR CORR_PAIS <> @EXCLUDE_CORR_PAIS)";

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
				{
					new CParameter() { ParameterName = "NORMALIZED_VALUE", Value = normalizedValue, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "EXCLUDE_CORR_PAIS", Value = excludeCorrPais, DbType = System.Data.DbType.Int32 },
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

		// Restringe los campos permitidos en las consultas dinámicas de duplicados.
		private static bool IsAllowedField(string fieldName) =>
			fieldName is "NOMBRE_PAIS" or "CODIGO_PAIS" or "NACIONALIDAD" or "NOMBRE_CORTO";

		// Reconoce excepciones de claves únicas para devolver un mensaje funcional en lugar del error técnico.
		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
		}
	}
}
