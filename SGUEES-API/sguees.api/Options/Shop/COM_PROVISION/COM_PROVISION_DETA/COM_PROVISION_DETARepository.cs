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
	public class COM_PROVISION_DETARepository : BaseRepository<COM_PROVISION_DETATable>, ICOM_PROVISION_DETARepository
	{
		private const string _TableName = "COM_PROVISION_DETA";

		public COM_PROVISION_DETARepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<COM_PROVISION_DETAView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
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

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<COM_PROVISION_DETAView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
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

		public async Task<CResult> GetAllDisponiblesAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var vQry = @"
SELECT A.*
FROM V_COM_DOCUMENTO_A_PROVISIONAR A
INNER JOIN COM_PROVISION P
	ON P.CORR_EMPRESA = A.CORR_EMPRESA
	AND P.CORR_PROVEEDOR = A.CORR_PROVEEDOR
WHERE P.CORR_EMPRESA = @CORR_EMPRESA
	AND P.ANIO_PERIODO = @ANIO_PERIODO
	AND P.MES_PERIODO = @MES_PERIODO
	AND P.CORR_PROVISION = @CORR_PROVISION
	AND A.ESTA_PROVISIONADO = 0
	AND A.CORR_PROVISION IS NULL
	AND A.SALDO_DOCUMENTO > 0
	AND A.ESTADO_DOCUMENTO = 'AP'
ORDER BY A.FECHA_DOCUMENTO DESC, A.CORR_DOCUMENTO DESC";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_DOCUMENTO_A_PROVISIONARView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
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

		public async Task<CResult> CreateAsync(COM_PROVISION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Add);
		}

		public async Task<CResult> UpdateAsync(COM_PROVISION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);
		}

		public async Task<CResult> DeleteAsync(COM_PROVISION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildMttoParameters(Data, UpdateType.Delete);

				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				var sysError = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;

				objResultado.Data = null;
				objResultado.Result = sysError == 0;
				objResultado.RowsAffected = (int)objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;
				objResultado.CodeHelper = objData.objCommand.Parameters["@CORR_DETA"].Value;
				objResultado.ErrorCode = sysError;
				objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				objResultado.ErrorSource = "C" + _TableName + ".Delete";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}

			return objResultado;
		}

		public async Task<CResult> SaveAsync(COM_PROVISION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType Tipo)
		{
			CResult objResultado = new();
			try
			{
				var p = BuildMttoParameters(Data, Tipo);

				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				var sysError = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;

				if (sysError == 0)
				{
					Data.CORR_DETA = (int)objData.objCommand.Parameters["@CORR_DETA"].Value;

					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PROVISION", Value = Data.CORR_PROVISION, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_DETA", Value = Data.CORR_DETA, DbType = System.Data.DbType.Int32 },
					};

					var readerget = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_PROVISION_DETAView>().FromDataReader(readerget).FirstOrDefault();

					readerget.Close();
					readerget = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_DETA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_DETA"].Value;
					objResultado.ErrorCode = sysError;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				}
			}
			catch (Exception e)
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

		private static List<CParameter> BuildMttoParameters(COM_PROVISION_DETATable Data, UpdateType Tipo)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = Tipo, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_PROVISION", Value = Data.CORR_PROVISION, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_DETA", Value = Data.CORR_DETA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@ANIO_PERIODO_COM", Value = Data.ANIO_PERIODO_COM, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@MES_PERIODO_COM", Value = Data.MES_PERIODO_COM, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_DOCUMENTO_COM", Value = Data.CORR_DOCUMENTO_COM, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@MONTO_DOCUMENTO", Value = Data.MONTO_DOCUMENTO, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "@MONTO_INICIAL", Value = Data.MONTO_INICIAL, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "@MONTO_PAGO", Value = Data.MONTO_PAGO, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "@MONTO_FINAL", Value = Data.MONTO_FINAL, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "@NO_CONTABILIZAR", Value = Data.NO_CONTABILIZAR, DbType = System.Data.DbType.Boolean },
			};
		}
	}
}
