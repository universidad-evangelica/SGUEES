using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using eadmindevprojectmanagement.Models;
using Microsoft.Extensions.Configuration;
namespace eadmindevprojectmanagement.Repositories
{
	public class COM_PAGORepository : BaseRepository<COM_PAGOTable>, ICOM_PAGORepository
	{
		private const string _TableName = "COM_PAGO";
		private const string _ViewName = "V_COM_PAGO";
		private const string _SpData = "PRAL_DATA_COM_PAGO";

		public COM_PAGORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
			=> await GetAllDataAsync(xWhere);

		public async Task<CResult> GetAllDataAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, _SpData, xWhere);
				var response = new List<COM_PAGOView>().FromDataReader(reader).ToList();
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
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> GetAllDesAplicarAsync(List<CParameter> xWhere)
			=> await GetAllDataAsync(xWhere);

		public async Task<CResult> GetAllDocAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_COM_PAGO_DOC", xWhere);
				var response = new List<COM_PAGO_DOCView>().FromDataReader(reader).ToList();
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

		public async Task<CResult> GetBeneficiarioAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, _SpData, xWhere);
				var response = new List<COM_PAGO_BENEFICIARIOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response != null ? 1 : 0;
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
				var response = new List<COM_PAGOView>().FromDataReader(reader).FirstOrDefault();
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

		public Task<CResult> CreateAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Add);

		public Task<CResult> UpdateAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);

		public Task<CResult> DeleteAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Delete);

		public Task<CResult> BorrarDetalleAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, (UpdateType)4);

		private async Task<CResult> SaveAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType tipo)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildMttoParameters(Data, tipo, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				var corrPago = (int)objData.objCommand.Parameters["@CORR_PAGO"].Value;
				var errorCode = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				var rowsAffected = Convert.ToInt32(objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value);

				Data.CORR_PAGO = corrPago;

				if (errorCode == 0)
				{
					var readerGet = await objData.GetDataReader(_ViewName, BuildKeyWhere(Data));
					var response = new List<COM_PAGOView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = rowsAffected;
					objResultado.CodeHelper = Data.CORR_PAGO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = rowsAffected;
					objResultado.CodeHelper = corrPago;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMessage;
					objResultado.ErrorSource = "CCOM_PAGO.Mtto(" + tipo + ")";
				}
			}
			catch (Exception e)
			{
				objResultado.Result = false;
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

		public async Task<CResult> AplicarAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PAGO", Value = Data.CORR_PAGO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_MOVIMIENTO", Value = Data.CORR_MOVIMIENTO ?? 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
					new() { ParameterName = "@GENERA_MOVIMIENTO_BANCARIO", Value = Data.GENERA_MOVIMIENTO_BANCARIO, DbType = System.Data.DbType.Boolean },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_COM_PAGO_APLICAR", true, p);

				var corrMovi = (int)objData.objCommand.Parameters["@CORR_MOVIMIENTO"].Value;
				var errorCode = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;

				if (errorCode == 0)
				{
					var readerGet = await objData.GetDataReader(_ViewName, BuildKeyWhere(Data));
					var response = new List<COM_PAGOView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.CodeHelper = corrMovi;
					objResultado.ErrorCode = 0;
				}
				else
				{
					objResultado.Result = false;
					objResultado.CodeHelper = corrMovi;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMessage;
					objResultado.ErrorSource = "CCOM_PAGO.Aplicar()";
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

		public async Task<CResult> DesAplicarAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecOperacionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_MTTO_COM_PAGO_DESAPLICAR", new List<CParameter>
			{
				new() { ParameterName = "@GENERA_MOVIMIENTO_BANCARIO", Value = Data.GENERA_MOVIMIENTO_BANCARIO, DbType = System.Data.DbType.Boolean },
			});

		public async Task<CResult> AnularAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PAGO", Value = Data.CORR_PAGO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_GENE_COM_ANULACION_PAGO", true, p);

				var errorCode = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;

				if (errorCode == 0)
				{
					var readerGet = await objData.GetDataReader(_ViewName, BuildKeyWhere(Data));
					var response = new List<COM_PAGOView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.CodeHelper = Data.CORR_PAGO;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMessage;
					objResultado.ErrorSource = "PRAL_GENE_COM_ANULACION_PAGO";
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

		public async Task<CResult> ActualizarCuentaAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_TIPO_MOVIMIENTO", Value = Data.CORR_TIPO_MOVIMIENTO ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PAGO", Value = Data.CORR_PAGO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_COM_PAGO_ACTUALIZAR_CUENTA", true, p);

				var corrPago = (int)objData.objCommand.Parameters["@CORR_PAGO"].Value;
				var errorCode = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				Data.CORR_PAGO = corrPago;

				if (errorCode == 0)
				{
					var readerGet = await objData.GetDataReader(_ViewName, BuildKeyWhere(Data));
					var response = new List<COM_PAGOView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.CodeHelper = corrPago;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMessage;
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

		public async Task<CResult> AsignarArchivoAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PAGO", Value = Data.CORR_PAGO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@CORR_ARCHIVO", Value = Data.CORR_ARCHIVO ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_COM_PAGO_CORR_ARCHIVO", true, p);

				var corrPago = (int)objData.objCommand.Parameters["@CORR_PAGO"].Value;
				var errorCode = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				Data.CORR_PAGO = corrPago;

				if (errorCode == 0)
				{
					var readerGet = await objData.GetDataReader(_ViewName, BuildKeyWhere(Data));
					var response = new List<COM_PAGOView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.CodeHelper = corrPago;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMessage;
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

		public async Task<CResult> GenerarContaAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PAGO", Value = Data.CORR_PAGO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_DETA", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_GENE_COM_PAGO_CONTA", true, p);

				var corrDeta = Convert.ToInt32(objData.objCommand.Parameters["@CORR_DETA"].Value);
				var errorCode = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				var rowsAffected = Convert.ToInt32(objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value);

				if (errorCode == 0)
				{
					objResultado.Result = true;
					objResultado.CodeHelper = corrDeta;
					objResultado.RowsAffected = rowsAffected;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMessage;
					objResultado.ErrorSource = "PRAL_GENE_COM_PAGO_CONTA";
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

		private async Task<CResult> ExecOperacionAsync(
			COM_PAGOTable Data,
			string vLOGIN_SISTEMA,
			string vESTACION,
			string spName,
			List<CParameter> extraParams)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PAGO", Value = Data.CORR_PAGO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				if (extraParams != null)
					p.AddRange(extraParams);

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

				var corrPago = (int)objData.objCommand.Parameters["@CORR_PAGO"].Value;
				var errorCode = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				Data.CORR_PAGO = corrPago;

				if (errorCode == 0)
				{
					var readerGet = await objData.GetDataReader(_ViewName, BuildKeyWhere(Data));
					var response = new List<COM_PAGOView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.CodeHelper = corrPago;
				}
				else
				{
					objResultado.Result = false;
					objResultado.CodeHelper = corrPago;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMessage;
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

		private static List<CParameter> BuildKeyWhere(COM_PAGOTable Data)
		{
			return new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PAGO", Value = Data.CORR_PAGO, DbType = System.Data.DbType.Int32 },
			};
		}

		private static List<CParameter> BuildMttoParameters(COM_PAGOTable Data, UpdateType tipo, string vLOGIN_SISTEMA, string vESTACION)
		{
			return new List<CParameter>
			{
				new() { ParameterName = "@TIPO_ACTUALIZA", Value = tipo, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_PAGO", Value = Data.CORR_PAGO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@CORR_TIPO_DOC", Value = Data.CORR_TIPO_DOC, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@FECHA_SOLICITUD", Value = Data.FECHA_SOLICITUD, DbType = System.Data.DbType.Date },
				new() { ParameterName = "@FECHA_PAGO", Value = Data.FECHA_PAGO, DbType = System.Data.DbType.Date },
				new() { ParameterName = "@CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_TIPO_CHEQUE", Value = Data.CORR_TIPO_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@NOMBRE_PARTIDA", Value = Data.NOMBRE_PARTIDA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@MONTO_PAGO", Value = Data.MONTO_PAGO, DbType = System.Data.DbType.Decimal },
				new() { ParameterName = "@ANIO_PERIODO_CHEQUE", Value = Data.ANIO_PERIODO_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@MES_PERIODO_CHEQUE", Value = Data.MES_PERIODO_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_TIPO_MOVIMIENTO", Value = Data.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_DOCUMENTO_CHEQUE", Value = Data.CORR_DOCUMENTO_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@ANIO_PERIODO_SOLI_CHEQUE", Value = Data.ANIO_PERIODO_SOLI_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@MES_PERIODO_SOLI_CHEQUE", Value = Data.MES_PERIODO_SOLI_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_TIPO_MOVIMIENTO_SOLI_CHEQUE", Value = Data.CORR_TIPO_MOVIMIENTO_SOLI_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_DOCUMENTO_SOLI_CHEQUE", Value = Data.CORR_DOCUMENTO_SOLI_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@ESTADO_PAGO", Value = Data.ESTADO_PAGO ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@PAGADO_CAJA_CHICA", Value = Data.PAGADO_CAJA_CHICA ?? false, DbType = System.Data.DbType.Boolean },
				new() { ParameterName = "@CORR_TIENDA", Value = Data.CORR_TIENDA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_CAJA", Value = Data.CORR_CAJA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@NOMBRE_BENEFICIARIO", Value = Data.NOMBRE_BENEFICIARIO ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
			};
		}
	}
}
