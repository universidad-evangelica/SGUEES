using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class BAN_TIPO_MOVI_SEGUN_BANCORepository : BaseRepository<BAN_TIPO_MOVI_SEGUN_BANCARIOTable>, IBAN_TIPO_MOVI_SEGUN_BANCORepository
	{
		private const string _TableName = "BAN_TIPO_MOVI_SEGUN_BANCO";
		private const string _SpData = "PRAL_DATA_BAN_TIPO_MOVI_SEGUN_BANCO";
		private const string _SpMtto = "PRAL_MTTO_BAN_TIPO_MOVI_SEGUN_BANCO";

		public BAN_TIPO_MOVI_SEGUN_BANCORepository(IConfiguration config) :
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
				var response = new List<BAN_TIPO_MOVI_SEGUN_BANCOView>().FromDataReader(reader).ToList();
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
					new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = xWhere.First(w => w.ParameterName == "CORR_TIPO_MOVIMIENTO").Value, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_BANCO", Value = xWhere.First(w => w.ParameterName == "CORR_BANCO").Value, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CODIGO_MOVIMIENTO", Value = xWhere.First(w => w.ParameterName == "CODIGO_MOVIMIENTO").Value, DbType = System.Data.DbType.String },
					new() { ParameterName = "OPCION_CONSULTA", Value = 0, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, _SpData, p);
				var response = new List<BAN_TIPO_MOVI_SEGUN_BANCOView>().FromDataReader(reader).FirstOrDefault();
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

		public async Task<CResult> CreateAsync(BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Add, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Update, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Delete, vLOGIN_SISTEMA, vESTACION);

		private async Task<CResult> ExecMttoAsync(
			BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data,
			UpdateType tipo,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildMttoParameters(Data, tipo, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, _SpMtto, true, p);
				Data.CODIGO_MOVIMIENTO = (string)objData.objCommand.Parameters["CODIGO_MOVIMIENTO"].Value;

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>
					{
						new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = Data.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_BANCO", Value = Data.CORR_BANCO, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CODIGO_MOVIMIENTO", Value = Data.CODIGO_MOVIMIENTO, DbType = System.Data.DbType.String },
					};

					var readerGet = await GetAsync(xWhere);
					objResultado.Data = readerGet.Data;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = 0;
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
			BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data,
			UpdateType tipo,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			return new List<CParameter>
			{
				new() { ParameterName = "TIPO_ACTUALIZA", Value = (int)tipo, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = Data.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_BANCO", Value = Data.CORR_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CODIGO_MOVIMIENTO", Value = Data.CODIGO_MOVIMIENTO ?? string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 10 },
				new() { ParameterName = "NOMBRE_MOVIMIENTO_SEGUN_BANCO", Value = Data.NOMBRE_MOVIMIENTO_SEGUN_BANCO ?? string.Empty, DbType = System.Data.DbType.String },
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
