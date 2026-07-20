using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class BAN_SOLI_CHEQUE_DETARepository : BaseRepository<BAN_SOLI_CHEQUE_DETATable>, IBAN_SOLI_CHEQUE_DETARepository
	{
		private const string _TableName = "BAN_SOLI_CHEQUE_DETA";
		private const string _ViewName = "V_BAN_SOLI_CHEQUE_DETA";
		private const string _SpMtto = "PRAL_MTTO_BAN_SOLI_CHEQUE_DETA";

		public BAN_SOLI_CHEQUE_DETARepository(IConfiguration config) :
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
				var response = new List<BAN_SOLI_CHEQUE_DETAView>().FromDataReader(reader).ToList();
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
				var response = new List<BAN_SOLI_CHEQUE_DETAView>().FromDataReader(reader).FirstOrDefault();
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

		public async Task<CResult> CreateAsync(BAN_SOLI_CHEQUE_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Add, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_SOLI_CHEQUE_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Update, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_SOLI_CHEQUE_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Delete, vLOGIN_SISTEMA, vESTACION);

		private async Task<CResult> ExecMttoAsync(
			BAN_SOLI_CHEQUE_DETATable Data,
			UpdateType tipo,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "TIPO_ACTUALIZA", Value = (int)tipo, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = Data.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_DOCUMENTO_DETA", Value = Data.CORR_DOCUMENTO_DETA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "CUENTA_CONTABLE", Value = Data.CUENTA_CONTABLE ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "CORR_CENTRO_COSTO", Value = Data.CORR_CENTRO_COSTO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "NOMBRE_TRAN", Value = Data.NOMBRE_TRAN ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "MONTO_CARGO", Value = Data.MONTO_CARGO, DbType = System.Data.DbType.Decimal },
					new() { ParameterName = "MONTO_ABONO", Value = Data.MONTO_ABONO, DbType = System.Data.DbType.Decimal },
					new() { ParameterName = "CORR_AUXILIAR", Value = Data.CORR_AUXILIAR, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "MONTO_CARGO_FORANEA", Value = Data.MONTO_CARGO_FORANEA, DbType = System.Data.DbType.Decimal },
					new() { ParameterName = "MONTO_ABONO_FORANEA", Value = Data.MONTO_ABONO_FORANEA, DbType = System.Data.DbType.Decimal },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, _SpMtto, true, p);
				Data.CORR_DOCUMENTO_DETA = (int)objData.objCommand.Parameters["CORR_DOCUMENTO_DETA"].Value;

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>
					{
						new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = Data.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_DOCUMENTO_DETA", Value = Data.CORR_DOCUMENTO_DETA, DbType = System.Data.DbType.Int32 },
					};

					var readerGet = await objData.GetDataReader(_ViewName, xWhere);
					var response = new List<BAN_SOLI_CHEQUE_DETAView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_DOCUMENTO_DETA ?? Data.CORR_DOCUMENTO_DETA;
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
