using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_PROVEEDOR_CUENTA_CONTABLERepository : BaseRepository<GEN_PROVEEDOR_CUENTA_CONTABLETable>, IGEN_PROVEEDOR_CUENTA_CONTABLERepository
	{
		private const string _ViewName = "V_GEN_PROVEEDOR_CUENTA_CONTABLE";
		private const string _SpMtto = "PRAL_MTTO_GEN_PROVEEDOR_CUENTA_CONTABLE";

		public GEN_PROVEEDOR_CUENTA_CONTABLERepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_PROVEEDOR_CUENTA_CONTABLEView>().FromDataReader(reader).ToList();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				objResultado.Data = null;
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
				var response = new List<GEN_PROVEEDOR_CUENTA_CONTABLEView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				objResultado.Data = null;
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

		public Task<CResult> CreateAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecMttoAsync(UpdateType.Add, Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecMttoAsync(UpdateType.Update, Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecMttoAsync(UpdateType.Delete, Data, vLOGIN_SISTEMA, vESTACION);

		private async Task<CResult> ExecMttoAsync(UpdateType tipo, GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var ahora = DateTime.Now;
				var p = new List<CParameter>
				{
					new() { ParameterName = "@TIPO_ACTUALIZA", Value = (int)tipo, DbType = DbType.Int32 },
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new() { ParameterName = "@CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = DbType.Int32 },
					new() { ParameterName = "@CORR_CUENTA", Value = Data.CORR_CUENTA, DbType = DbType.Int32, Direction = ParameterDirection.InputOutput },
					new() { ParameterName = "@TIPO_CUENTA", Value = Data.TIPO_CUENTA ?? string.Empty, DbType = DbType.String, Size = 3 },
					new() { ParameterName = "@CUENTA_CONTABLE", Value = Data.CUENTA_CONTABLE ?? string.Empty, DbType = DbType.String, Size = 30 },
					new() { ParameterName = "@ACTIVO", Value = Data.ACTIVO, DbType = DbType.Boolean },
					new() { ParameterName = "@USUARIO_CREA", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = DbType.String, Size = 30 },
					new() { ParameterName = "@FECHA_CREA", Value = ahora, DbType = DbType.DateTime },
					new() { ParameterName = "@ESTACION_CREA", Value = vESTACION ?? string.Empty, DbType = DbType.String, Size = 50 },
					new() { ParameterName = "@USUARIO_ACTU", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = DbType.String, Size = 30 },
					new() { ParameterName = "@FECHA_ACTU", Value = ahora, DbType = DbType.DateTime },
					new() { ParameterName = "@ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = DbType.String, Size = 50 },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = DbType.String, Size = 30 },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = DbType.String, Size = 50 },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = DbType.String, Direction = ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(CommandType.StoredProcedure, _SpMtto, true, p);
				var errorCode = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMsg = objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value?.ToString() ?? string.Empty;

				if (errorCode != 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMsg;
					return objResultado;
				}

				if (tipo == UpdateType.Delete)
				{
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.ErrorCode = 0;
					objResultado.CodeHelper = Data.CORR_CUENTA;
					return objResultado;
				}

				var corrCuenta = Convert.ToInt32(objData.objCommand.Parameters["@CORR_CUENTA"].Value);
				var xWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_CUENTA", Value = corrCuenta, DbType = DbType.Int32 },
				};
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_PROVEEDOR_CUENTA_CONTABLEView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0;
				objResultado.CodeHelper = corrCuenta;
			}
			catch (Exception e)
			{
				objResultado.Data = null;
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
