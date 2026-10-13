// Qué hace: repositorio de acceso a datos para GEN_PARAMETRO_PLANTILLA y su vista V_GEN_PARAMETRO_PLANTILLA.
// Cómo lo hace: hereda de BaseRepository e implementa métodos asíncronos para CRUD con eFramework.
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_PARAMETRO_PLANTILLARepository : BaseRepository<GEN_PARAMETRO_PLANTILLATable>, IGEN_PARAMETRO_PLANTILLARepository
	{
		private const string _TableName = "GEN_PARAMETRO_PLANTILLA";

		public GEN_PARAMETRO_PLANTILLARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Qué hace: obtiene la lista de plantillas de correo desde la vista.
		// Cómo lo hace: consulta V_GEN_PARAMETRO_PLANTILLA usando parámetros de filtro.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<GEN_PARAMETRO_PLANTILLAView>().FromDataReader(reader).ToList();

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
			catch (System.Exception e)
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

		// Qué hace: obtiene un registro específico de plantilla de correo.
		// Cómo lo hace: consulta V_GEN_PARAMETRO_PLANTILLA filtrado por clave primaria o código.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<GEN_PARAMETRO_PLANTILLAView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
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

		// Qué hace: inserta un nuevo registro de plantilla de correo con correlativo automático por empresa.
		// Cómo lo hace: ejecuta objData.Insert devolviendo el registro leíble desde la vista.
		public async Task<CResult> CreateAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = Data.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CODIGO_PLANTILLA", Value = Data.CODIGO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "NOMBRE_PLANTILLA", Value = Data.NOMBRE_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ASUNTO_PLANTILLA", Value = Data.ASUNTO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CUERPO_PLANTILLA", Value = Data.CUERPO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_PARAMETRO_SMTP", Value = Data.CORR_PARAMETRO_SMTP, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORREO_CC", Value = Data.CORREO_CC, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORREO_CCO", Value = Data.CORREO_CCO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ACTIVO_PLANTILLA", Value = Data.ACTIVO_PLANTILLA, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = vESTACION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 }
				};

				var reader = await objData.Insert(_TableName, p, "CORR_PARAMETRO_PLANTILLA", pWhere);
				var response = new List<GEN_PARAMETRO_PLANTILLAView>().FromDataReader(reader).FirstOrDefault();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
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

		// Qué hace: actualiza una plantilla de correo existente.
		// Cómo lo hace: ejecuta objData.Update filtrando por CORR_EMPRESA y CORR_PARAMETRO_PLANTILLA.
		public async Task<CResult> UpdateAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CODIGO_PLANTILLA", Value = Data.CODIGO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "NOMBRE_PLANTILLA", Value = Data.NOMBRE_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ASUNTO_PLANTILLA", Value = Data.ASUNTO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CUERPO_PLANTILLA", Value = Data.CUERPO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_PARAMETRO_SMTP", Value = Data.CORR_PARAMETRO_SMTP, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORREO_CC", Value = Data.CORREO_CC, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORREO_CCO", Value = Data.CORREO_CCO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ACTIVO_PLANTILLA", Value = Data.ACTIVO_PLANTILLA, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = Data.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<GEN_PARAMETRO_PLANTILLAView>().FromDataReader(reader).FirstOrDefault();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
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

		// Qué hace: elimina una plantilla de correo por sus llaves.
		// Cómo lo hace: ejecuta objData.Delete en GEN_PARAMETRO_PLANTILLA.
		public async Task<CResult> DeleteAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = Data.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 },
				};

				await objData.Delete(_TableName, pWhere);

				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
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
	}
}
