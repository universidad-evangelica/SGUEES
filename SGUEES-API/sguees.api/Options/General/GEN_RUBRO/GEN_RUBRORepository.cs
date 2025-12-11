using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_RUBRORepository: BaseRepository<GEN_RUBROTable>, IGEN_RUBRORepository
	{
		private const string _TableName = "GEN_RUBRO";
		
		public GEN_RUBRORepository(IConfiguration config) : 
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
				var response = new List<GEN_RUBROView>().FromDataReader(reader).ToList();
				
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
				var response = new List<GEN_RUBROView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(GEN_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput});
				p.Add(new CParameter() {ParameterName="NOMBRE_RUBRO",Value=Data.NOMBRE_RUBRO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="DESCRIPCION_RUBRO",Value=Data.DESCRIPCION_RUBRO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="ES_IMPUESTO",Value=Data.ES_IMPUESTO,DbType=System.Data.DbType.Boolean});
				p.Add(new CParameter() {ParameterName="POR_IMPUESTO",Value=Data.POR_IMPUESTO,DbType=System.Data.DbType.Decimal});
				p.Add(new CParameter() {ParameterName="MUESTRA_DETALLE",Value=Data.MUESTRA_DETALLE,DbType=System.Data.DbType.Boolean});
				p.Add(new CParameter() {ParameterName="MUESTRA_TOTAL",Value=Data.MUESTRA_TOTAL,DbType=System.Data.DbType.Boolean});
				p.Add(new CParameter() {ParameterName="SUMA_RESTA",Value=Data.SUMA_RESTA,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CLASE_RUBRO",Value=Data.CLASE_RUBRO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="TIPO_APLICACION",Value=Data.TIPO_APLICACION,DbType=System.Data.DbType.String});
				
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				
				var reader = await objData.Insert(_TableName,p,"CORR_RUBRO",pWhere);
				var response = new List<GEN_RUBROView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> UpdateAsync(GEN_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() {ParameterName="NOMBRE_RUBRO",Value=Data.NOMBRE_RUBRO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="DESCRIPCION_RUBRO",Value=Data.DESCRIPCION_RUBRO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="ES_IMPUESTO",Value=Data.ES_IMPUESTO,DbType=System.Data.DbType.Boolean});
				p.Add(new CParameter() {ParameterName="POR_IMPUESTO",Value=Data.POR_IMPUESTO,DbType=System.Data.DbType.Decimal});
				p.Add(new CParameter() {ParameterName="MUESTRA_DETALLE",Value=Data.MUESTRA_DETALLE,DbType=System.Data.DbType.Boolean});
				p.Add(new CParameter() {ParameterName="MUESTRA_TOTAL",Value=Data.MUESTRA_TOTAL,DbType=System.Data.DbType.Boolean});
				p.Add(new CParameter() {ParameterName="SUMA_RESTA",Value=Data.SUMA_RESTA,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CLASE_RUBRO",Value=Data.CLASE_RUBRO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="TIPO_APLICACION",Value=Data.TIPO_APLICACION,DbType=System.Data.DbType.String});
				
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32});
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<GEN_RUBROView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> DeleteAsync(GEN_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32});
				
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
	
		public async Task<CResult> GetLookUpAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure,"PRAL_DATA_"+_TableName, xWhere);
				var response = new List<GEN_RUBROView>().FromDataReader(reader).ToList();
				
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
