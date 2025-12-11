using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_TIPO_GASTO_IMPUESTORepository: BaseRepository<GEN_TIPO_GASTO_IMPUESTOTable>, IGEN_TIPO_GASTO_IMPUESTORepository
	{
		private const string _TableName = "GEN_TIPO_GASTO_IMPUESTO";
		
		public GEN_TIPO_GASTO_IMPUESTORepository(IConfiguration config) : 
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
				var response = new List<GEN_TIPO_GASTO_IMPUESTOView>().FromDataReader(reader).ToList();
				
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
				var response = new List<GEN_TIPO_GASTO_IMPUESTOView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(GEN_TIPO_GASTO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_TIPO_GASTO",Value=Data.CORR_TIPO_GASTO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput});
				p.Add(new CParameter() {ParameterName="IMPUESTO_INCLUIDO",Value=Data.IMPUESTO_INCLUIDO,DbType=System.Data.DbType.Boolean});
				p.Add(new CParameter() {ParameterName="ORDEN_TOTAL",Value=Data.ORDEN_TOTAL,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="PERMITE_EDITAR",Value=Data.PERMITE_EDITAR,DbType=System.Data.DbType.Boolean});
				
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_TIPO_GASTO",Value=Data.CORR_TIPO_GASTO,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32});
				
				var reader = await objData.Insert(_TableName,p,"",pWhere);
				var response = new List<GEN_TIPO_GASTO_IMPUESTOView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_RUBRO;
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
		
		public async Task<CResult> UpdateAsync(GEN_TIPO_GASTO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() {ParameterName="IMPUESTO_INCLUIDO",Value=Data.IMPUESTO_INCLUIDO,DbType=System.Data.DbType.Boolean});
				p.Add(new CParameter() {ParameterName="ORDEN_TOTAL",Value=Data.ORDEN_TOTAL,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="PERMITE_EDITAR",Value=Data.PERMITE_EDITAR,DbType=System.Data.DbType.Boolean});
				
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_TIPO_GASTO",Value=Data.CORR_TIPO_GASTO,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32});
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<GEN_TIPO_GASTO_IMPUESTOView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_RUBRO;
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
		
		public async Task<CResult> DeleteAsync(GEN_TIPO_GASTO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_TIPO_GASTO",Value=Data.CORR_TIPO_GASTO,DbType=System.Data.DbType.Int32});
				if(Data.CORR_RUBRO != 0 && !Data.CORR_RUBRO.Equals(DBNull.Value)){
					pWhere.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32});
				}
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_RUBRO;
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
