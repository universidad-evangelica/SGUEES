using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class BAN_CHEQUERARepository : BaseRepository<BAN_CHEQUERATable>, IBAN_CHEQUERARepository
	{
		private const string _TableName = "BAN_CHEQUERA";
		private const string _ViewName = "V_BAN_CHEQUERA";
		private const string _SpMtto = "PRAL_MTTO_BAN_CHEQUERA";

		public BAN_CHEQUERARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<BAN_CHEQUERAView>().FromDataReader(reader).ToList();
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
				var response = new List<BAN_CHEQUERAView>().FromDataReader(reader).FirstOrDefault();
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

		public async Task<CResult> GetActivaPorCuentaAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, @"
					SELECT TOP 1
						A.CORR_EMPRESA,
						A.CORR_CUENTA_BANCO,
						A.NUMERO_CUENTA_BANCO,
						A.CORR_CHEQUERA,
						A.NUMERO_CHEQUE_INICIAL,
						A.NUMERO_CHEQUE_FINAL,
						A.NUMERO_CHEQUE_ACTUAL,
						A.SERIE_CHEQUE,
						A.ESTADO_CHEQUERA,
						A.CLASE_CHEQUE
					FROM V_BAN_CHEQUERA A
					WHERE A.CORR_EMPRESA = @CORR_EMPRESA
					AND A.CORR_CUENTA_BANCO = @CORR_CUENTA_BANCO
					AND A.ESTADO_CHEQUERA = 'AC'
					ORDER BY A.CORR_CHEQUERA", xWhere);
				var response = new List<BAN_CHEQUERAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
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

		public async Task<CResult> CreateAsync(BAN_CHEQUERATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Add, vLOGIN_SISTEMA, vESTACION, validarPermiso: false);

		public async Task<CResult> UpdateAsync(BAN_CHEQUERATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Update, vLOGIN_SISTEMA, vESTACION, validarPermiso: true);

		public async Task<CResult> DeleteAsync(BAN_CHEQUERATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Delete, vLOGIN_SISTEMA, vESTACION, validarPermiso: false);

		private async Task<CResult> ExecMttoAsync(
			BAN_CHEQUERATable Data,
			UpdateType tipo,
			string vLOGIN_SISTEMA,
			string vESTACION,
			bool validarPermiso)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "TIPO_ACTUALIZA", Value = (int)tipo, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CHEQUERA", Value = Data.CORR_CHEQUERA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "NUMERO_CHEQUE_INICIAL", Value = Data.NUMERO_CHEQUE_INICIAL, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "NUMERO_CHEQUE_FINAL", Value = Data.NUMERO_CHEQUE_FINAL, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "NUMERO_CHEQUE_ACTUAL", Value = Data.NUMERO_CHEQUE_ACTUAL, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "SERIE_CHEQUE", Value = Data.SERIE_CHEQUE ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "ESTADO_CHEQUERA", Value = Data.ESTADO_CHEQUERA ?? "AC", DbType = System.Data.DbType.String },
					new() { ParameterName = "VALIDAR_PERMISO", Value = validarPermiso, DbType = System.Data.DbType.Boolean },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, _SpMtto, true, p);
				Data.CORR_CHEQUERA = (int)objData.objCommand.Parameters["CORR_CHEQUERA"].Value;

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>
					{
						new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_CHEQUERA", Value = Data.CORR_CHEQUERA, DbType = System.Data.DbType.Int32 },
					};

					var readerGet = await objData.GetDataReader(_ViewName, xWhere);
					var response = new List<BAN_CHEQUERAView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_CHEQUERA ?? Data.CORR_CHEQUERA;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + tipo + ")";
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
