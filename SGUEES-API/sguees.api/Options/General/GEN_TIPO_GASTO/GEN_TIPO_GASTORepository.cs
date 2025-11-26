using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public class GEN_TIPO_GASTORepository: BaseRepository<GEN_TIPO_GASTOTable>, IGEN_TIPO_GASTORepository
	{
		private const string _TableName = "GEN_TIPO_GASTO";
		
		public GEN_TIPO_GASTORepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<GEN_TIPO_GASTOView>().FromDataReader(reader).ToList();
				
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
			CResult objResultado = new CResult();
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<GEN_TIPO_GASTOView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(GEN_TIPO_GASTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_TIPO_GASTO",Value=Data.CORR_TIPO_GASTO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput});
				p.Add(new CParameter() {ParameterName="NOMBRE_TIPO_GASTO",Value=Data.NOMBRE_TIPO_GASTO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="ES_SERVICIO",Value=Data.ES_SERVICIO,DbType=System.Data.DbType.Boolean});
				p.Add(new CParameter() {ParameterName="ES_INTANGIBLE",Value=Data.ES_INTANGIBLE,DbType=System.Data.DbType.Boolean});
				
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				
				var reader = await objData.Insert(_TableName,p,"CORR_TIPO_GASTO",pWhere);
				var response = new List<GEN_TIPO_GASTOView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_TIPO_GASTO;
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
		
		public async Task<CResult> UpdateAsync(GEN_TIPO_GASTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() {ParameterName="NOMBRE_TIPO_GASTO",Value=Data.NOMBRE_TIPO_GASTO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="ES_SERVICIO",Value=Data.ES_SERVICIO,DbType=System.Data.DbType.Boolean});
				p.Add(new CParameter() {ParameterName="ES_INTANGIBLE",Value=Data.ES_INTANGIBLE,DbType=System.Data.DbType.Boolean});
				
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_TIPO_GASTO",Value=Data.CORR_TIPO_GASTO,DbType=System.Data.DbType.Int32});
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<GEN_TIPO_GASTOView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_TIPO_GASTO;
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
			
			return objResultado;
		}
		
		public async Task<CResult> DeleteAsync(GEN_TIPO_GASTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_TIPO_GASTO",Value=Data.CORR_TIPO_GASTO,DbType=System.Data.DbType.Int32});
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_TIPO_GASTO;
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
			
			return objResultado;
		}
		public async Task<CResult> GetAllLookUpAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<GEN_TIPO_GASTOView>().FromDataReader(reader).ToList();
				
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
	}
}
