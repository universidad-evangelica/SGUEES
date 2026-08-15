using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class BAN_CONCILIA_BANCARIARepository : BaseRepository<BAN_CONCILIA_BANCARIATable>, IBAN_CONCILIA_BANCARIARepository
	{
		private const string _TableName = "BAN_CONCILIA_BANCARIA";
		private const string _ViewName = "V_BAN_CONCILIA_BANCARIA";
		private const string _SpData = "PRAL_DATA_BAN_CONCILIA_BANCARIA";
		private const string _SpMtto = "PRAL_MTTO_BAN_CONCILIA_BANCARIA";
		private readonly string _connectionString;

		public BAN_CONCILIA_BANCARIARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
			_connectionString = config.GetConnectionString("defaultConnection") ?? string.Empty;
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				EnsureSqlParameter(xWhere, "TIPO_CONSULTA", 1, System.Data.DbType.Int32);
				EnsureSqlParameter(xWhere, "OPCION_CONSULTA", 0, System.Data.DbType.Int32);

				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, _SpData, xWhere);
				var response = new List<BAN_CONCILIA_BANCARIAView>().FromDataReader(reader).ToList();
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
					new() { ParameterName = "OPCION_CONSULTA", Value = 0, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, _SpData, p);
				var response = new List<BAN_CONCILIA_BANCARIAView>().FromDataReader(reader).FirstOrDefault();
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

		public async Task<CResult> CreateAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Add, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Update, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Delete, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> GetPendientesAsync(List<CParameter> xWhere)
			=> await ReadSpListAsync<BAN_CONCILIA_BANCARIA_PENDIENTEView>("PRAL_DATA_BAN_CONCILIA_BANCARIA_PENDIENTE", xWhere);

		public async Task<CResult> GetResumenAsync(List<CParameter> xWhere)
			=> await ReadSpListAsync<BAN_CONCILIA_BANCARIA_RESUMENView>("PRAL_DATA_BAN_CONCILIA_BANCARIA_RESUMEN", xWhere);

		public async Task<CResult> GetMoviAsync(List<CParameter> xWhere)
			=> await ReadSpListAsync<BAN_CONCILIA_BANCARIA_MOVIView>("PRAL_DATA_BAN_CONCILIA_BANCARIA_MOVI", xWhere);

		public async Task<CResult> AplicarAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecOperacionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_MTTO_BAN_CONCILIA_BANCARIA_APLICAR");

		public async Task<CResult> DesAplicarAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecOperacionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_MTTO_BAN_CONCILIA_BANCARIA_DESAPLICAR");

		public async Task<CResult> GenerarConciliacionAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecGeneracionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_BAN_CONCILIACION_BANCARIA");

		public async Task<CResult> ReconstruirMovimientosAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecGeneracionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_BAN_CONCILIACION_BANCARIA_MOVI");

		public async Task<CResult> ForzarConciliacionAsync(BAN_CONCILIA_FORZADAParam Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecForzarAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_BAN_CONCILIACION_FORZADA");

		public async Task<CResult> RevertirConciliacionAsync(BAN_CONCILIA_REVERTIRParam Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecRevertirAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> MarcarConciliadoAsync(BAN_CONCILIA_FORZADAParam Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMarcarAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> ImportarExcelAsync(BAN_CONCILIA_BANCARIA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				if (Data.Rows == null || Data.Rows.Count == 0)
				{
					objResultado.Data = new { CORR_CONCILIACION = Data.CORR_CONCILIACION };
					objResultado.Result = true;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_CONCILIACION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
					return objResultado;
				}

				static string Trunc(string? value, int maxLen)
					=> (value ?? string.Empty).Trim().Length <= maxLen
						? (value ?? string.Empty).Trim()
						: (value ?? string.Empty).Trim()[..maxLen];

				var table = new DataTable();
				table.Columns.Add("CORR", typeof(int));
				table.Columns.Add("NUMERO_REFERENCIA_BANCO", typeof(string));
				table.Columns.Add("CODIGO_TIPO_MOVIMIENTO", typeof(string));
				table.Columns.Add("NOMBRE_TIPO_MOVIMIENTO", typeof(string));
				table.Columns.Add("FECHA_MOVIMIENTO", typeof(System.DateTime));
				table.Columns.Add("MONTO_CARGO", typeof(decimal));
				table.Columns.Add("MONTO_ABONO", typeof(decimal));
				table.Columns.Add("SALDO", typeof(decimal));

				foreach (var row in Data.Rows)
				{
					table.Rows.Add(
						row.CORR,
						Trunc(row.NUMERO_REFERENCIA_BANCO, 255),
						Trunc(row.CODIGO_TIPO_MOVIMIENTO, 30),
						Trunc(row.NOMBRE_TIPO_MOVIMIENTO, 255),
						row.FECHA_MOVIMIENTO,
						row.MONTO_CARGO,
						row.MONTO_ABONO,
						0m);
				}

				await using var conn = new SqlConnection(_connectionString);
				await conn.OpenAsync();
				await using var cmd = new SqlCommand("PRAL_GENE_BAN_CONCILIA_BANCARIA_MOV_EXCEL", conn)
				{
					CommandType = CommandType.StoredProcedure,
				};

				cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = Data.CORR_EMPRESA });
				cmd.Parameters.Add(new SqlParameter("@CORR_CUENTA_BANCO", SqlDbType.Int) { Value = Data.CORR_CUENTA_BANCO });
				cmd.Parameters.Add(new SqlParameter("@CORR_CONCILIACION", SqlDbType.Int)
				{
					Value = Data.CORR_CONCILIACION,
					Direction = ParameterDirection.InputOutput,
				});
				cmd.Parameters.Add(new SqlParameter("@CORR_BANCO", SqlDbType.Int) { Value = Data.CORR_BANCO });
				cmd.Parameters.Add(new SqlParameter("@BAN_CONCILIA_BANCARIA_MOV_EXCEL", SqlDbType.Structured)
				{
					TypeName = "dbo.T_BAN_CONCILIACION_BANCARIA_MOV_EXCEL",
					Value = table,
				});
				cmd.Parameters.Add(new SqlParameter("@SYS_LOGIN_USUARIO", SqlDbType.VarChar, 30) { Value = vLOGIN_SISTEMA ?? string.Empty });
				cmd.Parameters.Add(new SqlParameter("@SYS_ESTACION", SqlDbType.VarChar, 50) { Value = vESTACION ?? string.Empty });
				cmd.Parameters.Add(new SqlParameter("@SYS_FILAS_AFECTADAS", SqlDbType.Int) { Direction = ParameterDirection.Output });
				cmd.Parameters.Add(new SqlParameter("@SYS_NUMERO_ERROR", SqlDbType.Decimal) { Direction = ParameterDirection.Output });
				cmd.Parameters.Add(new SqlParameter("@SYS_MENSAJE_ERROR", SqlDbType.VarChar, 4000) { Direction = ParameterDirection.Output });

				await cmd.ExecuteNonQueryAsync();

				var errorCode = System.Convert.ToInt32(cmd.Parameters["@SYS_NUMERO_ERROR"].Value ?? 0);
				var errorMessage = cmd.Parameters["@SYS_MENSAJE_ERROR"].Value?.ToString() ?? string.Empty;
				var rowsAffected = System.Convert.ToInt32(cmd.Parameters["@SYS_FILAS_AFECTADAS"].Value ?? 0);
				Data.CORR_CONCILIACION = System.Convert.ToInt32(cmd.Parameters["@CORR_CONCILIACION"].Value ?? Data.CORR_CONCILIACION);

				if (errorCode == 0)
				{
					objResultado.Data = new { CORR_CONCILIACION = Data.CORR_CONCILIACION };
					objResultado.Result = true;
					objResultado.RowsAffected = rowsAffected;
					objResultado.CodeHelper = Data.CORR_CONCILIACION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
				}
				else
				{
					objResultado.Data = new { CORR_CONCILIACION = Data.CORR_CONCILIACION };
					objResultado.Result = false;
					objResultado.RowsAffected = rowsAffected;
					objResultado.CodeHelper = Data.CORR_CONCILIACION;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMessage;
					objResultado.ErrorSource = "C" + _TableName + ".ImportarExcel";
				}
			}
			catch (System.Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}

			return objResultado;
		}

		private async Task<CResult> ReadSpListAsync<T>(string spName, List<CParameter> xWhere) where T : new()
		{
			CResult objResultado = new();
			try
			{
				EnsureSqlParameter(xWhere, "TIPO_CONSULTA", 1, System.Data.DbType.Int32);
				EnsureSqlParameter(xWhere, "OPCION_CONSULTA", 0, System.Data.DbType.Int32);

				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, spName, xWhere);
				var response = new List<T>().FromDataReader(reader).ToList();
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

		private async Task<CResult> ExecMttoAsync(
			BAN_CONCILIA_BANCARIATable Data,
			UpdateType tipo,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildMttoParameters(Data, tipo, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, _SpMtto, true, p);
				Data.CORR_CONCILIACION = (int)objData.objCommand.Parameters["CORR_CONCILIACION"].Value;

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var readerGet = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, _SpData, BuildGetParams(Data));
					var response = new List<BAN_CONCILIA_BANCARIAView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_CONCILIACION ?? Data.CORR_CONCILIACION;
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

		private async Task<CResult> ExecOperacionAsync(
			BAN_CONCILIA_BANCARIATable Data,
			string vLOGIN_SISTEMA,
			string vESTACION,
			string spName)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildOperacionParameters(Data, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					Data.CORR_CONCILIACION = (int)objData.objCommand.Parameters["CORR_CONCILIACION"].Value;
					var readerGet = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, _SpData, BuildGetParams(Data));
					var response = new List<BAN_CONCILIA_BANCARIAView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_CONCILIACION;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + spName + ")";
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

		private async Task<CResult> ExecGeneracionAsync(
			BAN_CONCILIA_BANCARIATable Data,
			string vLOGIN_SISTEMA,
			string vESTACION,
			string spName)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildOperacionParameters(Data, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					Data.CORR_CONCILIACION = (int)objData.objCommand.Parameters["CORR_CONCILIACION"].Value;
					objResultado.Data = Data;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_CONCILIACION;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + spName + ")";
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

		private async Task<CResult> ExecForzarAsync(
			BAN_CONCILIA_FORZADAParam Data,
			string vLOGIN_SISTEMA,
			string vESTACION,
			string spName)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CONCILIACION", Value = Data.CORR_CONCILIACION, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CONCILIACION_DETA", Value = Data.CORR_CONCILIACION_DETA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_PARTIDA_DETA", Value = Data.CORR_PARTIDA_DETA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					objResultado.Data = Data;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_CONCILIACION_DETA;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + spName + ")";
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

		private async Task<CResult> ExecRevertirAsync(
			BAN_CONCILIA_REVERTIRParam Data,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CONCILIACION", Value = Data.CORR_CONCILIACION, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CONCILIACION_DETA", Value = Data.CORR_CONCILIACION_DETA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_GENE_BAN_CONCILIACION_REVERTIR", true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					objResultado.Data = Data;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["CORR_CONCILIACION_DETA"].Value;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(PRAL_GENE_BAN_CONCILIACION_REVERTIR)";
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

		private async Task<CResult> ExecMarcarAsync(
			BAN_CONCILIA_FORZADAParam Data,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_PARTIDA_DETA", Value = Data.CORR_PARTIDA_DETA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_BAN_CONCILIA_BANCARIA_MARCAR", true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					objResultado.Data = Data;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_PARTIDA_DETA;
				}
				else
				{
					objResultado.Result = false;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(PRAL_MTTO_BAN_CONCILIA_BANCARIA_MARCAR)";
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

		private static List<CParameter> BuildGetParams(BAN_CONCILIA_BANCARIATable Data)
		{
			return new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = 3, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CONCILIACION", Value = Data.CORR_CONCILIACION, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "OPCION_CONSULTA", Value = 0, DbType = System.Data.DbType.Int32 },
			};
		}

		private static List<CParameter> BuildOperacionParameters(
			BAN_CONCILIA_BANCARIATable Data,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			return new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CONCILIACION", Value = Data.CORR_CONCILIACION, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
			};
		}

		private static List<CParameter> BuildMttoParameters(
			BAN_CONCILIA_BANCARIATable Data,
			UpdateType tipo,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			var now = System.DateTime.Now;

			return new List<CParameter>
			{
				new() { ParameterName = "TIPO_ACTUALIZA", Value = (int)tipo, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CONCILIACION", Value = Data.CORR_CONCILIACION, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "FECHA_CONCILIACION", Value = Data.FECHA_CONCILIACION, DbType = System.Data.DbType.Date },
				new() { ParameterName = "SALDO_CUENTA_BANCO", Value = Data.SALDO_CUENTA_BANCO ?? 0m, DbType = System.Data.DbType.Decimal },
				new() { ParameterName = "SALDO_CUENTA_CONTA", Value = Data.SALDO_CUENTA_CONTA ?? 0m, DbType = System.Data.DbType.Decimal },
				new() { ParameterName = "ESTADO_CONCILIACION", Value = Data.ESTADO_CONCILIACION ?? "DI", DbType = System.Data.DbType.String },
				new() { ParameterName = "USUARIO_CREA", Value = tipo == UpdateType.Add ? vLOGIN_SISTEMA ?? string.Empty : Data.USUARIO_CREA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "FECHA_CREA", Value = tipo == UpdateType.Add ? now : Data.FECHA_CREA ?? now, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "ESTACION_CREA", Value = tipo == UpdateType.Add ? vESTACION ?? string.Empty : Data.ESTACION_CREA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "FECHA_ACTU", Value = now, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
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
