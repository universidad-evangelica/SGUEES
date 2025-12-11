using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_RUBRO_SUMARepository: BaseRepository<GEN_RUBRO_SUMATable>, IGEN_RUBRO_SUMARepository
	{
		private const string _TableName = "GEN_RUBRO_SUMA";
		
		public GEN_RUBRO_SUMARepository(IConfiguration config) : 
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
				var response = new List<GEN_RUBRO_SUMAView>().FromDataReader(reader).ToList();
				
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
				var response = new List<GEN_RUBRO_SUMAView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(GEN_RUBRO_SUMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_SUMA",Value=Data.CORR_SUMA,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput});
				
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32});
				if(Data.CORR_SUMA != 0 && !Data.CORR_SUMA.Equals(DBNull.Value))
				{
					pWhere.Add(new CParameter() {ParameterName="CORR_SUMA",Value=Data.CORR_SUMA,DbType=System.Data.DbType.Int32});
				}
				
				var reader = await objData.Insert(_TableName,p,"",pWhere);
				var response = new List<GEN_RUBRO_SUMAView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_SUMA;
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
		
		public async Task<CResult> UpdateAsync(GEN_RUBRO_SUMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var p = new List<CParameter>();
				
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_SUMA",Value=Data.CORR_SUMA,DbType=System.Data.DbType.Int32});
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<GEN_RUBRO_SUMAView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_SUMA;
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
		
		public async Task<CResult> DeleteAsync(GEN_RUBRO_SUMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_SUMA",Value=Data.CORR_SUMA,DbType=System.Data.DbType.Int32});
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_SUMA;
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
	}
}
