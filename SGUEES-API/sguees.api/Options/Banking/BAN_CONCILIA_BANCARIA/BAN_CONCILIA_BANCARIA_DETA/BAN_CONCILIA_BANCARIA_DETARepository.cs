using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class BAN_CONCILIA_BANCARIA_DETARepository : BaseRepository<BAN_CONCILIA_BANCARIA_DETATable>, IBAN_CONCILIA_BANCARIA_DETARepository
	{
		private const string _TableName = "BAN_CONCILIA_BANCARIA_DETA";
		private const string _SpData = "PRAL_DATA_BAN_CONCILIA_BANCARIA_DETA";
		private const string _SpMtto = "PRAL_MTTO_BAN_CONCILIA_BANCARIA_DETA";

		public BAN_CONCILIA_BANCARIA_DETARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				EnsureSqlParameter(xWhere, "TIPO_CONSULTA", 1, System.Data.DbType.Int32);
				EnsureSqlParameter(xWhere, "OPCION_CONSULTA", 0, System.Data.DbType.Int32);

				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, _SpData, xWhere);
				var response = new List<BAN_CONCILIA_BANCARIA_DETAView>().FromDataReader(reader).ToList();
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
				var p = new List<CParameter>
				{
					new() { ParameterName = "TIPO_CONSULTA", Value = 3, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_EMPRESA", Value = xWhere.First(w => w.ParameterName == "CORR_EMPRESA").Value, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.First(w => w.ParameterName == "CORR_CUENTA_BANCO").Value, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CONCILIACION", Value = xWhere.First(w => w.ParameterName == "CORR_CONCILIACION").Value, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CONCILIACION_DETA", Value = xWhere.First(w => w.ParameterName == "CORR_CONCILIACION_DETA").Value, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "OPCION_CONSULTA", Value = 0, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, _SpData, p);
				var response = new List<BAN_CONCILIA_BANCARIA_DETAView>().FromDataReader(reader).FirstOrDefault();
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

		public async Task<CResult> CreateAsync(BAN_CONCILIA_BANCARIA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Add, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_CONCILIA_BANCARIA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Update, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_CONCILIA_BANCARIA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Delete, vLOGIN_SISTEMA, vESTACION);

		private async Task<CResult> ExecMttoAsync(
			BAN_CONCILIA_BANCARIA_DETATable Data,
			UpdateType tipo,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildMttoParameters(Data, tipo, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, _SpMtto, true, p);
				Data.CORR_CONCILIACION_DETA = (int)objData.objCommand.Parameters["CORR_CONCILIACION_DETA"].Value;

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>
					{
						new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_CONCILIACION", Value = Data.CORR_CONCILIACION, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_CONCILIACION_DETA", Value = Data.CORR_CONCILIACION_DETA, DbType = System.Data.DbType.Int32 },
					};

					var readerGet = await GetAsync(xWhere);
					objResultado.Data = readerGet.Data;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_CONCILIACION_DETA;
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

		private static List<CParameter> BuildMttoParameters(
			BAN_CONCILIA_BANCARIA_DETATable Data,
			UpdateType tipo,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			return new List<CParameter>
			{
				new() { ParameterName = "TIPO_ACTUALIZA", Value = (int)tipo, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CONCILIACION", Value = Data.CORR_CONCILIACION, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CONCILIACION_DETA", Value = Data.CORR_CONCILIACION_DETA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "FECHA_MOVIMIENTO", Value = Data.FECHA_MOVIMIENTO, DbType = System.Data.DbType.Date },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = Data.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "NUMERO_REFERENCIA_BANCO", Value = Data.NUMERO_REFERENCIA_BANCO ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "MONTO_CARGO", Value = Data.MONTO_CARGO, DbType = System.Data.DbType.Decimal },
				new() { ParameterName = "MONTO_ABONO", Value = Data.MONTO_ABONO, DbType = System.Data.DbType.Decimal },
				new() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PARTIDA", Value = Data.CORR_PARTIDA ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PARTIDA_DETA", Value = Data.CORR_PARTIDA_DETA ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CODIGO_TRANSACCION", Value = Data.CODIGO_TRANSACCION ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "DESCRIPCION_TRANSACCION", Value = Data.DESCRIPCION_TRANSACCION ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
			};
		}

		private static void EnsureSqlParameter(List<CParameter> xWhere, string name, object value, System.Data.DbType dbType)
		{
			var existing = xWhere.FirstOrDefault(p => p.ParameterName == name);
			if (existing == null)
			{
				xWhere.Add(new CParameter
				{
					ParameterName = name,
					Value = value ?? System.DBNull.Value,
					DbType = dbType,
				});
				return;
			}

			if (existing.Value == null)
			{
				existing.Value = value ?? System.DBNull.Value;
			}
		}
	}
}
