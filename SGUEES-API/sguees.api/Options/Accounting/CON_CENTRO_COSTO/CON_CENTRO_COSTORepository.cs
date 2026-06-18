using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_CENTRO_COSTORepository: BaseRepository<CON_CENTRO_COSTOTable>, ICON_CENTRO_COSTORepository
	{
		private const string _TableName = "CON_CENTRO_COSTO";
		
		public CON_CENTRO_COSTORepository(IConfiguration config) : 
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
				var response = new List<CON_CENTRO_COSTOView>().FromDataReader(reader).ToList();
				
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
				var response = new List<CON_CENTRO_COSTOView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(CON_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=Data.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="NOMBRE_CENTRO",Value=Data.NOMBRE_CENTRO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CODIGO_CENTRO_COSTO",Value=Data.CODIGO_CENTRO_COSTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_TIPO_CENTRO_COSTO",Value=Data.CORR_TIPO_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ESTADO_CENTRO_COSTO",Value=Data.ESTADO_CENTRO_COSTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_UNIDAD_NEGOCIO",Value=Data.CORR_UNIDAD_NEGOCIO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_AREA_FUNCIONAL",Value=Data.CORR_AREA_FUNCIONAL,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CODIGO_TERMINACION",Value=Data.CODIGO_TERMINACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_EMPLEADO_JEFE",Value=Data.CORR_EMPLEADO_JEFE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLIENTE",Value=Data.CORR_CLIENTE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="FECHA_INICIAL",Value=Data.FECHA_INICIAL,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="FECHA_FINAL",Value=Data.FECHA_FINAL,DbType=System.Data.DbType.DateTime},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Insert(_TableName,p,"CORR_CENTRO_COSTO",pWhere);
				var response = new List<CON_CENTRO_COSTOView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_CENTRO_COSTO;
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
		
		public async Task<CResult> UpdateAsync(CON_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NOMBRE_CENTRO",Value=Data.NOMBRE_CENTRO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CODIGO_CENTRO_COSTO",Value=Data.CODIGO_CENTRO_COSTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_TIPO_CENTRO_COSTO",Value=Data.CORR_TIPO_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ESTADO_CENTRO_COSTO",Value=Data.ESTADO_CENTRO_COSTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_UNIDAD_NEGOCIO",Value=Data.CORR_UNIDAD_NEGOCIO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_AREA_FUNCIONAL",Value=Data.CORR_AREA_FUNCIONAL,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CODIGO_TERMINACION",Value=Data.CODIGO_TERMINACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_EMPLEADO_JEFE",Value=Data.CORR_EMPLEADO_JEFE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLIENTE",Value=Data.CORR_CLIENTE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="FECHA_INICIAL",Value=Data.FECHA_INICIAL,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="FECHA_FINAL",Value=Data.FECHA_FINAL,DbType=System.Data.DbType.DateTime},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=Data.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<CON_CENTRO_COSTOView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_CENTRO_COSTO;
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
		
		public async Task<CResult> DeleteAsync(CON_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=Data.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_CENTRO_COSTO;
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
	}
}
