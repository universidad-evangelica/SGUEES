using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public class SC_TIPO_CONTRATACIONRepository: BaseRepository<SC_TIPO_CONTRATACIONTable>, ISC_TIPO_CONTRATACIONRepository
	{
		private const string _TableName = "SC_TIPO_CONTRATACION";
		
		public SC_TIPO_CONTRATACIONRepository(IConfiguration config) : 
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
				var response = new List<SC_TIPO_CONTRATACIONView>().FromDataReader(reader).ToList();
				
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
				var response = new List<SC_TIPO_CONTRATACIONView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(SC_TIPO_CONTRATACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_TIPO_CONTRATACION",Value=Data.CORR_TIPO_CONTRATACION,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="NOMBRE_TIPO_CONTRATACION",Value=Data.NOMBRE_TIPO_CONTRATACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Insert(_TableName,p,"CORR_TIPO_CONTRATACION",pWhere);
				var response = new List<SC_TIPO_CONTRATACIONView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_TIPO_CONTRATACION;
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
		
		public async Task<CResult> UpdateAsync(SC_TIPO_CONTRATACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NOMBRE_TIPO_CONTRATACION",Value=Data.NOMBRE_TIPO_CONTRATACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_TIPO_CONTRATACION",Value=Data.CORR_TIPO_CONTRATACION,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<SC_TIPO_CONTRATACIONView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_TIPO_CONTRATACION;
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
		
		public async Task<CResult> DeleteAsync(SC_TIPO_CONTRATACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_TIPO_CONTRATACION",Value=Data.CORR_TIPO_CONTRATACION,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_TIPO_CONTRATACION;
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
