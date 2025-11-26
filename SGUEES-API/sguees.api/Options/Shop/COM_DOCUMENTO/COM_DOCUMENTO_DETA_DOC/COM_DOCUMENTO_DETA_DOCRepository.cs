using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public class COM_DOCUMENTO_DETA_DOCRepository: BaseRepository<COM_DOCUMENTO_DETA_DOCTable>, ICOM_DOCUMENTO_DETA_DOCRepository
	{
		private const string _TableName = "COM_DOCUMENTO_DETA_DOC";
		
		public COM_DOCUMENTO_DETA_DOCRepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<COM_DOCUMENTO_DETA_DOCView>().FromDataReader(reader).ToList();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper =  0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
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
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<COM_DOCUMENTO_DETA_DOCView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper =  0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}
		
		public async Task<CResult> CreateAsync(COM_DOCUMENTO_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Add);
		}
		
		public async Task<CResult> UpdateAsync(COM_DOCUMENTO_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);
		}
		
		public async Task<CResult> DeleteAsync(COM_DOCUMENTO_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
                {
                    new() { ParameterName = "@TIPO_ACTUALIZA", Value = UpdateType.Delete, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@ANIO_PERIODO_DOC", Value = Data.ANIO_PERIODO_DOC, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@MES_PERIODO_DOC", Value = Data.MES_PERIODO_DOC, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@CORR_DOCUMENTO_DOC", Value = Data.CORR_DOCUMENTO_DOC, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new() { ParameterName = "@MONTO_DOCUMENTO", Value = Data.MONTO_DOCUMENTO, DbType = System.Data.DbType.Decimal },
                    new() { ParameterName = "@MONTO_INICIAL", Value = Data.MONTO_INICIAL, DbType = System.Data.DbType.Decimal },
                    new() { ParameterName = "@MONTO_INGRESO", Value = Data.MONTO_INGRESO, DbType = System.Data.DbType.Decimal },
                    new() { ParameterName = "@MONTO_FINAL", Value = Data.MONTO_FINAL, DbType = System.Data.DbType.Decimal },

                    //Parametros para gestionar la operación
                    new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
                    new() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
                    new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 }
                };
				var vResultado = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);
				
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = (Int32) objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;
					objResultado.CodeHelper = objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (Int32) objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (String) objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Delete";
				}else{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = (Int32) objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;
					objResultado.CodeHelper = objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (Int32) objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (String) objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Delete";

				}
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			
			return objResultado;
		}
	
		public async Task<CResult> SaveAsync(COM_DOCUMENTO_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType Tipo)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
                {
                    new() { ParameterName = "@TIPO_ACTUALIZA", Value = Tipo, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@ANIO_PERIODO_DOC", Value = Data.ANIO_PERIODO_DOC, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@MES_PERIODO_DOC", Value = Data.MES_PERIODO_DOC, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@CORR_DOCUMENTO_DOC", Value = Data.CORR_DOCUMENTO_DOC, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new() { ParameterName = "@MONTO_DOCUMENTO", Value = Data.MONTO_DOCUMENTO, DbType = System.Data.DbType.Decimal },
                    new() { ParameterName = "@MONTO_INICIAL", Value = Data.MONTO_INICIAL, DbType = System.Data.DbType.Decimal },
                    new() { ParameterName = "@MONTO_INGRESO", Value = Data.MONTO_INGRESO, DbType = System.Data.DbType.Decimal },
                    new() { ParameterName = "@MONTO_FINAL", Value = Data.MONTO_FINAL, DbType = System.Data.DbType.Decimal },

                    //Parametros para gestionar la operación
                    new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
                    new() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
                    new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 }
                };

				var vResultado = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					p.Clear();

					p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });

					var readerget = await objData.GetDataReader("V_"+_TableName, p);
					var response = new List<COM_DOCUMENTO_DETA_DOCView>().FromDataReader(readerget).FirstOrDefault();

					readerget.Close();
					readerget = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";							
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
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
	}
}
