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
	public class COM_PAGO_DETARepository : BaseRepository<COM_PAGO_DETATable>, ICOM_PAGO_DETARepository
	{
		private const string _TableName = "COM_PAGO_DETA";
		private const string _ViewName = "V_COM_PAGO_DETA";
		private const string _SpData = "PRAL_DATA_COM_PAGO_DETA";

		public COM_PAGO_DETARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, _SpData, xWhere);
				var response = new List<COM_PAGO_DETAView>().FromDataReader(reader).ToList();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
			}
			catch (Exception e)
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
				var response = new List<COM_PAGO_DETAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
			}
			catch (Exception e)
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

		public Task<CResult> CreateAsync(COM_PAGO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Add);

		public Task<CResult> UpdateAsync(COM_PAGO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);

		public Task<CResult> DeleteAsync(COM_PAGO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Delete);

		private async Task<CResult> SaveAsync(COM_PAGO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType tipo)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@TIPO_ACTUALIZA", Value = tipo, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PAGO", Value = Data.CORR_PAGO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_DETA", Value = Data.CORR_DETA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@ANIO_PERIODO_COM", Value = Data.ANIO_PERIODO_COM, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@MES_PERIODO_COM", Value = Data.MES_PERIODO_COM, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_DOCUMENTO_COM", Value = Data.CORR_DOCUMENTO_COM, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@MONTO_DOCUMENTO", Value = Data.MONTO_DOCUMENTO, DbType = System.Data.DbType.Decimal },
					new() { ParameterName = "@MONTO_INICIAL", Value = Data.MONTO_INICIAL, DbType = System.Data.DbType.Decimal },
					new() { ParameterName = "@MONTO_PAGO", Value = Data.MONTO_PAGO, DbType = System.Data.DbType.Decimal },
					new() { ParameterName = "@MONTO_FINAL", Value = Data.MONTO_FINAL, DbType = System.Data.DbType.Decimal },
					new() { ParameterName = "@GENERA_DETALLE_CONTABLE", Value = Data.GENERA_DETALLE_CONTABLE, DbType = System.Data.DbType.Boolean },
					new() { ParameterName = "@GENERA_CONCEPTO", Value = Data.GENERA_CONCEPTO, DbType = System.Data.DbType.Boolean },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				var corrDeta = (int)objData.objCommand.Parameters["@CORR_DETA"].Value;
				var errorCode = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				Data.CORR_DETA = corrDeta;

				if (errorCode == 0)
				{
					var readerGet = await objData.GetDataReader(_ViewName, BuildKeyWhere(Data));
					var response = new List<COM_PAGO_DETAView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.CodeHelper = corrDeta;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMessage;
					objResultado.CodeHelper = corrDeta;
				}
			}
			catch (Exception e)
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

		private static List<CParameter> BuildKeyWhere(COM_PAGO_DETATable Data)
		{
			return new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PAGO", Value = Data.CORR_PAGO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DETA", Value = Data.CORR_DETA, DbType = System.Data.DbType.Int32 },
			};
		}
	}
}
