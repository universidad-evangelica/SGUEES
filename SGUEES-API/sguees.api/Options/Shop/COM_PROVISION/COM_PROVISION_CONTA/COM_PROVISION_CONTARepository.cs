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
	public class COM_PROVISION_CONTARepository : BaseRepository<COM_PROVISION_CONTATable>, ICOM_PROVISION_CONTARepository
	{
		private const string _TableName = "COM_PROVISION_CONTA";

		public COM_PROVISION_CONTARepository(IConfiguration config) :
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
				var response = new List<COM_PROVISION_CONTAView>().FromDataReader(reader).ToList();

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
				var response = new List<COM_PROVISION_CONTAView>().FromDataReader(reader).FirstOrDefault();

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

		public async Task<CResult> CreateAsync(COM_PROVISION_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Add);
		}

		public async Task<CResult> UpdateAsync(COM_PROVISION_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);
		}

		public async Task<CResult> DeleteAsync(COM_PROVISION_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION)
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

		public async Task<CResult> SaveAsync(COM_PROVISION_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType Tipo)
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
					var response = new List<COM_PROVISION_CONTAView>().FromDataReader(readerget).FirstOrDefault();

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

		private static List<CParameter> BuildMttoParameters(COM_PROVISION_CONTATable Data, UpdateType Tipo)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = Tipo, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_PROVISION", Value = Data.CORR_PROVISION, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_DETA", Value = Data.CORR_DETA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@CUENTA_CONTABLE", Value = Data.CUENTA_CONTABLE ?? "", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@CORR_CENTRO_COSTO", Value = Data.CORR_CENTRO_COSTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@NOMBRE_TRAN", Value = Data.NOMBRE_TRAN ?? "", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@MONTO_CARGO", Value = Data.MONTO_CARGO, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "@MONTO_ABONO", Value = Data.MONTO_ABONO, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "@CORR_AUXILIAR", Value = Data.CORR_AUXILIAR, DbType = System.Data.DbType.Int32 },
			};
		}
	}
}
