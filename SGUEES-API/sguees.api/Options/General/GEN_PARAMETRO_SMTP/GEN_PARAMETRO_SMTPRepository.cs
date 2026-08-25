using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	// Qué hace: consulta/CRUD de parámetros SMTP desde GEN_PARAMETRO_SMTP (sin usar COM_PARAMETRO).
	public class GEN_PARAMETRO_SMTPRepository : BaseRepository<GEN_PARAMETRO_SMTPTable>, IGEN_PARAMETRO_SMTPRepository
	{
		private const string _TableName = "GEN_PARAMETRO_SMTP";

		public GEN_PARAMETRO_SMTPRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Qué hace: lista configuraciones SMTP desde la vista.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<GEN_PARAMETRO_SMTPView>().FromDataReader(reader).ToList();

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

		// Qué hace: obtiene un registro SMTP (por CORR_EMPRESA y/o CORR_PARAMETRO_SMTP).
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<GEN_PARAMETRO_SMTPView>().FromDataReader(reader).FirstOrDefault();

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

		public async Task<CResult> CreateAsync(GEN_PARAMETRO_SMTPTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_SMTP", Value = Data.CORR_PARAMETRO_SMTP, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORREO_REMITENTE", Value = Data.CORREO_REMITENTE, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_REMITENTE", Value = Data.USUARIO_REMITENTE, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CONTRASENA_REMITENTE", Value = Data.CONTRASENA_REMITENTE, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "SERVIDOR_CORREO", Value = Data.SERVIDOR_CORREO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "PUERTO_CORREO", Value = Data.PUERTO_CORREO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "USA_SSL_CORREO", Value = Data.USA_SSL_CORREO, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = vESTACION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime },
				};

				var reader = await objData.Insert(_TableName, p, "CORR_PARAMETRO_SMTP", new List<CParameter>());
				var response = new List<GEN_PARAMETRO_SMTPView>().FromDataReader(reader).FirstOrDefault();

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

		public async Task<CResult> UpdateAsync(GEN_PARAMETRO_SMTPTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORREO_REMITENTE", Value = Data.CORREO_REMITENTE, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_REMITENTE", Value = Data.USUARIO_REMITENTE, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CONTRASENA_REMITENTE", Value = Data.CONTRASENA_REMITENTE, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "SERVIDOR_CORREO", Value = Data.SERVIDOR_CORREO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "PUERTO_CORREO", Value = Data.PUERTO_CORREO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "USA_SSL_CORREO", Value = Data.USA_SSL_CORREO, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_SMTP", Value = Data.CORR_PARAMETRO_SMTP, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<GEN_PARAMETRO_SMTPView>().FromDataReader(reader).FirstOrDefault();

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

		public async Task<CResult> DeleteAsync(GEN_PARAMETRO_SMTPTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_SMTP", Value = Data.CORR_PARAMETRO_SMTP, DbType = System.Data.DbType.Int32 },
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
