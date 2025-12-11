using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_PARAMETRORepository: BaseRepository<GEN_PARAMETROTable>, IGEN_PARAMETRORepository
	{
		private const string _TableName = "GEN_PARAMETRO";
		
		public GEN_PARAMETRORepository(IConfiguration config) : 
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
				var response = new List<GEN_PARAMETROView>().FromDataReader(reader).ToList();
				
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
				var response = new List<GEN_PARAMETROView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(GEN_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="CORR_AMBIENTE",Value=Data.CORR_AMBIENTE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="URL_CONSULTA",Value=Data.URL_CONSULTA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORREO_REMITENTE",Value=Data.CORREO_REMITENTE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_REMITENTE",Value=Data.USUARIO_REMITENTE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CONTRASENA_REMITENTE",Value=Data.CONTRASENA_REMITENTE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="SERVIDOR_CORREO",Value=Data.SERVIDOR_CORREO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="PUERTO_CORREO",Value=Data.PUERTO_CORREO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="USA_SSL_CORREO",Value=Data.USA_SSL_CORREO,DbType=System.Data.DbType.Boolean},
				};
				
				var pWhere = new List<CParameter>
				{
				};
				
				var reader = await objData.Insert(_TableName,p,"CORR_EMPRESA",pWhere);
				var response = new List<GEN_PARAMETROView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_EMPRESA;
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
		
		public async Task<CResult> UpdateAsync(GEN_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_AMBIENTE",Value=Data.CORR_AMBIENTE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="URL_CONSULTA",Value=Data.URL_CONSULTA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORREO_REMITENTE",Value=Data.CORREO_REMITENTE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_REMITENTE",Value=Data.USUARIO_REMITENTE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CONTRASENA_REMITENTE",Value=Data.CONTRASENA_REMITENTE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="SERVIDOR_CORREO",Value=Data.SERVIDOR_CORREO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="PUERTO_CORREO",Value=Data.PUERTO_CORREO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="USA_SSL_CORREO",Value=Data.USA_SSL_CORREO,DbType=System.Data.DbType.Boolean},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<GEN_PARAMETROView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_EMPRESA;
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
		
		public async Task<CResult> DeleteAsync(GEN_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_EMPRESA;
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
