// Qué hace: persistencia SQL del catálogo de documentos de admisión.
// Cómo lo hace: CRUD y ActivarInactivar sobre ACA_DOCUMENTO_ADMISION / V_ACA_DOCUMENTO_ADMISION (sin empresa).
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class ACA_DOCUMENTO_ADMISIONRepository : BaseRepository<ACA_DOCUMENTO_ADMISIONTable>, IACA_DOCUMENTO_ADMISIONRepository
	{
		private const string _TableName = "ACA_DOCUMENTO_ADMISION";
		private const string _ViewName = "V_ACA_DOCUMENTO_ADMISION";
		private const string _CampoPk = "CORR_DOCUMENTO_ADMISION";
		private const string _CampoEstado = "ACTIVO";
		private const bool _UsaEmpresa = false;

		public ACA_DOCUMENTO_ADMISIONRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Qué hace: lista los documentos del catálogo.
		// Cómo lo hace: lee V_ACA_DOCUMENTO_ADMISION y ordena por ORDEN y correlativo.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<ACA_DOCUMENTO_ADMISIONView>().FromDataReader(reader)
					.OrderBy(x => x.ORDEN)
					.ThenBy(x => x.CORR_DOCUMENTO_ADMISION)
					.ToList();

				reader.Close();

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

		// Qué hace: obtiene un documento.
		// Cómo lo hace: consulta la vista con el filtro recibido.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<ACA_DOCUMENTO_ADMISIONView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_DOCUMENTO_ADMISION ?? 0;
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

		// Qué hace: inserta un documento.
		// Cómo lo hace: Insert con OUTPUT/re-read de la vista; controla código duplicado.
		public async Task<CResult> CreateAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = Data.CORR_DOCUMENTO_ADMISION, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "NOMBRE_DOCUMENTO", Value = Data.NOMBRE_DOCUMENTO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO", Value = Data.CODIGO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "OBLIGATORIO", Value = Data.OBLIGATORIO ?? false, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "ORDEN", Value = Data.ORDEN, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ACTIVO", Value = Data.ACTIVO ?? true, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "FORMATOS_PERMITIDOS", Value = Data.FORMATOS_PERMITIDOS, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "TAMANO_MAXIMO_MB", Value = Data.TAMANO_MAXIMO_MB, DbType = System.Data.DbType.Byte },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>();
				var reader = await objData.Insert(_TableName, p, _CampoPk, pWhere);
				var response = new List<ACA_DOCUMENTO_ADMISIONView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_DOCUMENTO_ADMISION ?? 0;
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
					? "Ya existe un documento con ese código."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: actualiza un documento.
		// Cómo lo hace: Update por PK y relee la vista; controla código duplicado.
		public async Task<CResult> UpdateAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "NOMBRE_DOCUMENTO", Value = Data.NOMBRE_DOCUMENTO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO", Value = Data.CODIGO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "OBLIGATORIO", Value = Data.OBLIGATORIO ?? false, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "ORDEN", Value = Data.ORDEN, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "FORMATOS_PERMITIDOS", Value = Data.FORMATOS_PERMITIDOS, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "TAMANO_MAXIMO_MB", Value = Data.TAMANO_MAXIMO_MB, DbType = System.Data.DbType.Byte },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = Data.CORR_DOCUMENTO_ADMISION, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<ACA_DOCUMENTO_ADMISIONView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_DOCUMENTO_ADMISION ?? Data.CORR_DOCUMENTO_ADMISION;
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
					? "Ya existe un documento con ese código."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: elimina un documento.
		// Cómo lo hace: Delete por PK; ante FK informa registros asociados.
		public async Task<CResult> DeleteAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = Data.CORR_DOCUMENTO_ADMISION, DbType = System.Data.DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_DOCUMENTO_ADMISION;
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
				objResultado.ErrorMessage = "No se puede eliminar el documento porque tiene registros asociados en otras tablas.";
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: activa o inactiva el registro.
		// Cómo lo hace: ejecuta PRAL_MTTO_CATALOGO_ESTADO_BIT sin empresa y relee la vista.
		public async Task<CResult> ActivarInactivarAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = 0, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_DOCUMENTO_ADMISION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = Data.CORR_DOCUMENTO_ADMISION, DbType = System.Data.DbType.Int32 },
					};

					var readerGet = await objData.GetDataReader(_ViewName, xWhere);
					var response = new List<ACA_DOCUMENTO_ADMISIONView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_DOCUMENTO_ADMISION ?? Data.CORR_DOCUMENTO_ADMISION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
					objResultado.ErrorSource = string.Empty;
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_DOCUMENTO_ADMISION;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(Update)";
				}
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = Data.CORR_DOCUMENTO_ADMISION;
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

		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
		}
	}
}
