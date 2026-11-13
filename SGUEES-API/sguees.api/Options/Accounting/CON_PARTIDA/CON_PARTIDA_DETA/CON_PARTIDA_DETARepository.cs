using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_PARTIDA_DETARepository: BaseRepository<CON_PARTIDA_DETATable>, ICON_PARTIDA_DETARepository
	{
		private const string _TableName = "CON_PARTIDA_DETA";
		
		public CON_PARTIDA_DETARepository(IConfiguration config) : 
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
				var response = new List<CON_PARTIDA_DETAView>().FromDataReader(reader).ToList();
				
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
				var response = new List<CON_PARTIDA_DETAView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await Save(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Add);
		}
		
		public async Task<CResult> UpdateAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await Save(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);
		}
		
		public async Task<CResult> DeleteAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = UpdateType.Delete, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA_DETA", Value = Data.CORR_PARTIDA_DETA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@CUENTA_CONTABLE", Value = Data.CUENTA_CONTABLE ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CORR_CENTRO_COSTO", Value = Data.CORR_CENTRO_COSTO ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MONTO_CARGO", Value = System.DBNull.Value, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@MONTO_ABONO", Value = System.DBNull.Value, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@NOMBRE_TRAN", Value = Data.NOMBRE_TRAN ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@MONTO_CARGO_FORANEA", Value = System.DBNull.Value, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@MONTO_ABONO_FORANEA", Value = System.DBNull.Value, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@FACTOR_CAMBIO", Value = System.DBNull.Value, DbType = System.Data.DbType.Decimal });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
				p.Add(new CParameter() { ParameterName = "@CORR_AUXILIAR", Value = Data.CORR_AUXILIAR ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Int32 });
				
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);
				
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value);
					objResultado.CodeHelper = Data.CORR_PARTIDA_DETA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA_DETA;
					objResultado.ErrorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Delete.ToString() + ")";
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
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}
		
		public async Task<CResult> Save(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType Tipo)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = Tipo, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA_DETA", Value = Data.CORR_PARTIDA_DETA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@CUENTA_CONTABLE", Value = Data.CUENTA_CONTABLE ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CORR_CENTRO_COSTO", Value = Data.CORR_CENTRO_COSTO ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MONTO_CARGO", Value = Data.MONTO_CARGO, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@MONTO_ABONO", Value = Data.MONTO_ABONO, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@NOMBRE_TRAN", Value = Data.NOMBRE_TRAN ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@MONTO_CARGO_FORANEA", Value = Data.MONTO_CARGO_FORANEA ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@MONTO_ABONO_FORANEA", Value = Data.MONTO_ABONO_FORANEA ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@FACTOR_CAMBIO", Value = System.DBNull.Value, DbType = System.Data.DbType.Decimal });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
				p.Add(new CParameter() { ParameterName = "@CORR_AUXILIAR", Value = Data.CORR_AUXILIAR ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Int32 });
				
				var vResultado = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);
				
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					Data.CORR_PARTIDA_DETA = (int)objData.objCommand.Parameters["@CORR_PARTIDA_DETA"].Value;
					
					p.Clear();
					p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_PARTIDA_DETA", Value = Data.CORR_PARTIDA_DETA, DbType = System.Data.DbType.Int32 });
					
					var readerGet = await objData.GetDataReader("V_" + _TableName, p);
					var response = new List<CON_PARTIDA_DETAView>().FromDataReader(readerGet).FirstOrDefault();
					
					readerGet.Close();
					readerGet = null;
					
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_PARTIDA_DETA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA_DETA;
					objResultado.ErrorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + Tipo.ToString() + ")";
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
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}
	}
}
