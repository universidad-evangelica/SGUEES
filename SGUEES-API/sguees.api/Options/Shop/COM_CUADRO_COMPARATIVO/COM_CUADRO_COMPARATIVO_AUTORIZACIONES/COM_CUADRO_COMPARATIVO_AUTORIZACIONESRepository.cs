using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public class COM_CUADRO_COMPARATIVO_AUTORIZACIONESRepository: BaseRepository<COM_CUADRO_COMPARATIVO_AUTORIZACIONESTable>, ICOM_CUADRO_COMPARATIVO_AUTORIZACIONESRepository
	{
		private const string _TableName = "COM_CUADRO_COMPARATIVO_AUTORIZACIONES";
		
		public COM_CUADRO_COMPARATIVO_AUTORIZACIONESRepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var vQry =@$"
							   SELECT * FROM V_COM_CUADRO_COMPARATIVO_AUTORIZACIONES
							   WHERE CORR_EMPRESA = @CORR_EMPRESA
							   AND ANIO_PERIODO = @ANIO_PERIODO
							   AND CORR_CUADRO_COMPARATIVO = @CORR_CUADRO_COMPARATIVO
							   ORDER BY ORDEN_REVISION ASC
							";
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_AUTORIZACIONESView>().FromDataReader(reader).ToList();
				
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
				var response = new List<COM_CUADRO_COMPARATIVO_AUTORIZACIONESView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVO_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="LOGIN_SISTEMA",Value=Data.LOGIN_SISTEMA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="FECHA_AUTORIZACION",Value=Data.FECHA_AUTORIZACION,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTADO_AUTORIZACION",Value=Data.ESTADO_AUTORIZACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ORDEN_REVISION",Value=Data.ORDEN_REVISION,DbType=System.Data.DbType.Int32},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="LOGIN_SISTEMA",Value=Data.LOGIN_SISTEMA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					
				};
				
				var reader = await objData.Insert(_TableName,p,"",pWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_AUTORIZACIONESView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_CUADRO_COMPARATIVO;
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
		
		public async Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVO_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="FECHA_AUTORIZACION",Value=Data.FECHA_AUTORIZACION,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTADO_AUTORIZACION",Value=Data.ESTADO_AUTORIZACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ORDEN_REVISION",Value=Data.ORDEN_REVISION,DbType=System.Data.DbType.Int32},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="LOGIN_SISTEMA",Value=Data.LOGIN_SISTEMA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_AUTORIZACIONESView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_CUADRO_COMPARATIVO;
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
		
		public async Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVO_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="LOGIN_SISTEMA",Value=Data.LOGIN_SISTEMA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_CUADRO_COMPARATIVO;
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
