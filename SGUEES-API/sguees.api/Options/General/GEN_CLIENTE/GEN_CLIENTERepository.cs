using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_CLIENTERepository : BaseRepository<GEN_CLIENTETable>, IGEN_CLIENTERepository
	{
		private const string _TableName = "GEN_CLIENTE";
		private const string _ViewName = "V_GEN_CLIENTE";
		private const string _CampoPk = "CORR_CLIENTE";
		private const string _CampoEstado = "ESTA_ACTIVO";
		private const bool _UsaEmpresa = true;

		public GEN_CLIENTERepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_CLIENTEView>().FromDataReader(reader).ToList();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
			}
			catch (System.Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_CLIENTEView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
			}
			catch (System.Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> CreateAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CLIENTE", Value = Data.CORR_CLIENTE, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CODIGO_CLIENTE", Value = Data.CODIGO_CLIENTE ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "NOMBRE_CLIENTE", Value = Data.NOMBRE_CLIENTE ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "NOMBRE_CONTACTO", Value = Data.NOMBRE_CONTACTO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "DUI", Value = Data.DUI ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "NIT", Value = Data.NIT ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "TELEFONO_1", Value = Data.TELEFONO_1 ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "CORREO_ELECTRONICO", Value = Data.CORREO_ELECTRONICO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "ESTA_ACTIVO", Value = Data.ESTA_ACTIVO ?? true, DbType = System.Data.DbType.Boolean },
					new() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
					new() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				};
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.Insert(_TableName, p, "CORR_CLIENTE", pWhere);
				var response = new List<GEN_CLIENTEView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_CLIENTE ?? 0;
			}
			catch (System.Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> UpdateAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CODIGO_CLIENTE", Value = Data.CODIGO_CLIENTE ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "NOMBRE_CLIENTE", Value = Data.NOMBRE_CLIENTE ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "NOMBRE_CONTACTO", Value = Data.NOMBRE_CONTACTO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "DUI", Value = Data.DUI ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "NIT", Value = Data.NIT ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "TELEFONO_1", Value = Data.TELEFONO_1 ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "CORREO_ELECTRONICO", Value = Data.CORREO_ELECTRONICO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
					new() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				};
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CLIENTE", Value = Data.CORR_CLIENTE, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<GEN_CLIENTEView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
			}
			catch (System.Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> DeleteAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CLIENTE", Value = Data.CORR_CLIENTE, DbType = System.Data.DbType.Int32 },
				};
				await objData.Delete(_TableName, pWhere);
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
			}
			catch (System.Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> ActivarInactivarAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = System.Data.DbType.String },
					new() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = System.Data.DbType.String },
					new() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = System.Data.DbType.String },
					new() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = System.Data.DbType.Boolean },
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_CLIENTE, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>
					{
						new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_CLIENTE", Value = Data.CORR_CLIENTE, DbType = System.Data.DbType.Int32 },
					};
					var readerGet = await objData.GetDataReader(_ViewName, xWhere);
					var response = new List<GEN_CLIENTEView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_CLIENTE ?? Data.CORR_CLIENTE;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				}
			}
			catch (System.Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}
	}
}
