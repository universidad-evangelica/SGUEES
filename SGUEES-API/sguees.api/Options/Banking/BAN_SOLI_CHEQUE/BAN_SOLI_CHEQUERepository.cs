using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class BAN_SOLI_CHEQUERepository : BaseRepository<BAN_SOLI_CHEQUETable>, IBAN_SOLI_CHEQUERepository
	{
		private const string _TableName = "BAN_SOLI_CHEQUE";
		private const string _ViewName = "V_BAN_SOLI_CHEQUE";
		private const string _SpMtto = "PRAL_MTTO_BAN_SOLI_CHEQUE";

		public BAN_SOLI_CHEQUERepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var corrDocumento = System.Convert.ToInt32(
					xWhere.FirstOrDefault(p => p.ParameterName == "CORR_DOCUMENTO")?.Value ?? 0);
				var fechaInicial = xWhere.FirstOrDefault(p => p.ParameterName == "FECHA_INICIAL")?.Value;
				var fechaFinal = xWhere.FirstOrDefault(p => p.ParameterName == "FECHA_FINAL")?.Value;

				EnsureSqlParameter(xWhere, "ESTADO_DOCUMENTO", string.Empty, System.Data.DbType.String);
				EnsureSqlParameter(xWhere, "CORR_CUENTA_BANCO", 0, System.Data.DbType.Int32);
				EnsureSqlParameter(xWhere, "EXCLUIR_ANULADOS", false, System.Data.DbType.Boolean);

				var reader = corrDocumento == 0 && fechaInicial != null && fechaFinal != null
					? await objData.GetDataReader(System.Data.CommandType.Text, @"
						SELECT A.*
						FROM V_BAN_SOLI_CHEQUE A
						WHERE A.CORR_EMPRESA = @CORR_EMPRESA
						AND A.FECHA_EMISION >= @FECHA_INICIAL
						AND A.FECHA_EMISION <= @FECHA_FINAL
						AND (
							@ESTADO_DOCUMENTO IS NULL
							OR LTRIM(RTRIM(@ESTADO_DOCUMENTO)) = ''
							OR A.ESTADO_DOCUMENTO = @ESTADO_DOCUMENTO
						)
						AND (
							@CORR_CUENTA_BANCO IS NULL
							OR @CORR_CUENTA_BANCO = 0
							OR A.CORR_CUENTA_BANCO = @CORR_CUENTA_BANCO
						)
						AND (
							@EXCLUIR_ANULADOS IS NULL
							OR @EXCLUIR_ANULADOS = 0
							OR A.ESTADO_DOCUMENTO <> 'AN'
						)
						ORDER BY A.FECHA_EMISION DESC, A.CORR_DOCUMENTO DESC", xWhere)
					: await objData.GetDataReader(_ViewName, xWhere);

				var response = new List<BAN_SOLI_CHEQUEView>().FromDataReader(reader).ToList();
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
				var response = new List<BAN_SOLI_CHEQUEView>().FromDataReader(reader).FirstOrDefault();
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

		public async Task<CResult> CreateAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Add, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Update, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecMttoAsync(Data, UpdateType.Delete, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> EnviarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecSolicitudOperacionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_MTTO_BAN_SOLI_CHEQUE_ENVIAR_SOLICITUD");

		public async Task<CResult> CancelarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecSolicitudOperacionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_MTTO_BAN_SOLI_CHEQUE_CANCELAR_SOLICITUD");

		public async Task<CResult> AutorizarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await ExecAutorizarSolicitudAsync(Data, vLOGIN_SISTEMA, vESTACION);

		private async Task<CResult> ExecMttoAsync(
			BAN_SOLI_CHEQUETable Data,
			UpdateType tipo,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildMttoParameters(Data, tipo, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, _SpMtto, true, p);
				Data.CORR_DOCUMENTO = (int)objData.objCommand.Parameters["CORR_DOCUMENTO"].Value;

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var readerGet = await objData.GetDataReader(_ViewName, BuildKeyWhere(Data));
					var response = new List<BAN_SOLI_CHEQUEView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_DOCUMENTO ?? Data.CORR_DOCUMENTO;
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

		private async Task<CResult> ExecSolicitudOperacionAsync(
			BAN_SOLI_CHEQUETable Data,
			string vLOGIN_SISTEMA,
			string vESTACION,
			string spName)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_TIPO_MOVIMIENTO", Value = Data.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var readerGet = await objData.GetDataReader(_ViewName, BuildKeyWhere(Data));
					var response = new List<BAN_SOLI_CHEQUEView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
					objResultado.ErrorSource = string.Empty;
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_DOCUMENTO;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + spName + ")";
				}
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

		private async Task<CResult> ExecAutorizarSolicitudAsync(
			BAN_SOLI_CHEQUETable Data,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();
			const string spName = "PRAL_MTTO_BAN_SOLI_CHEQUE_APLICAR_SOLICITUD";

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_TIPO_MOVIMIENTO", Value = Data.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var readerGet = await objData.GetDataReader(_ViewName, BuildKeyWhere(Data));
					var response = new List<BAN_SOLI_CHEQUEView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
					objResultado.ErrorSource = string.Empty;
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_DOCUMENTO;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + spName + ")";
				}
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

		private static List<CParameter> BuildKeyWhere(BAN_SOLI_CHEQUETable Data)
		{
			return new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = Data.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
			};
		}

		private static List<CParameter> BuildMttoParameters(
			BAN_SOLI_CHEQUETable Data,
			UpdateType tipo,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			var now = System.DateTime.Now;

			return new List<CParameter>
			{
				new() { ParameterName = "TIPO_ACTUALIZA", Value = (int)tipo, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = Data.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "NUMERO_DOCUMENTO", Value = Data.NUMERO_DOCUMENTO, DbType = System.Data.DbType.Int64 },
				new() { ParameterName = "FECHA_EMISION", Value = Data.FECHA_EMISION, DbType = System.Data.DbType.Date },
				new() { ParameterName = "NOMBRE_PARTIDA", Value = Data.NOMBRE_PARTIDA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CLIENTE", Value = Data.CORR_CLIENTE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "NOMBRE_BENEFICIARIO", Value = Data.NOMBRE_BENEFICIARIO, DbType = System.Data.DbType.String },
				new() { ParameterName = "MONTO_DOCUMENTO", Value = Data.MONTO_DOCUMENTO, DbType = System.Data.DbType.Decimal },
				new() { ParameterName = "ESTADO_DOCUMENTO", Value = Data.ESTADO_DOCUMENTO ?? "DI", DbType = System.Data.DbType.String },
				new() { ParameterName = "SOLICITADO_POR", Value = Data.SOLICITADO_POR ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "FECHA_SOLICITADO", Value = Data.FECHA_SOLICITADO, DbType = System.Data.DbType.Date },
				new() { ParameterName = "FECHA_APLICADO", Value = Data.FECHA_APLICADO, DbType = System.Data.DbType.Date },
				new() { ParameterName = "CANTIDAD_LETRAS", Value = Data.CANTIDAD_LETRAS ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "USUARIO_CREA", Value = tipo == UpdateType.Add ? vLOGIN_SISTEMA ?? string.Empty : Data.USUARIO_CREA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "FECHA_CREA", Value = tipo == UpdateType.Add ? now : Data.FECHA_CREA ?? now, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "ESTACION_CREA", Value = tipo == UpdateType.Add ? vESTACION ?? string.Empty : Data.ESTACION_CREA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "FECHA_ACTU", Value = now, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_TIPO_CHEQUE", Value = Data.CORR_TIPO_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO_CHEQUE", Value = Data.ANIO_PERIODO_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO_CHEQUE", Value = Data.MES_PERIODO_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO_CHEQUE", Value = Data.CORR_TIPO_MOVIMIENTO_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO_CHEQUE", Value = Data.CORR_DOCUMENTO_CHEQUE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_MONEDA", Value = Data.CORR_MONEDA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "FACTOR_CAMBIO", Value = Data.FACTOR_CAMBIO ?? 1m, DbType = System.Data.DbType.Decimal },
				new() { ParameterName = "OPERADOR", Value = Data.OPERADOR ?? "*", DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
			};
		}
	}
}
