using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class COM_BITACORARepository: BaseRepository<COM_BITACORATable>, ICOM_BITACORARepository
	{
		private const string _TableName = "COM_BITACORA";
		
		public COM_BITACORARepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_" + _TableName, xWhere);
				var response = new List<COM_BITACORAView>().FromDataReader(reader).ToList();
				
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
				var response = new List<COM_BITACORAView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(COM_BITACORATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_BITACORA",Value=Data.CORR_BITACORA,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="FECHA_BITACORA",Value=Data.FECHA_BITACORA,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="CODIGO_OPCION",Value=Data.CODIGO_OPCION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CLASE_BITACORA",Value=Data.CLASE_BITACORA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="LLAVE_TRANSACCION",Value=Data.LLAVE_TRANSACCION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="REFERENCIA_TRANSACCION",Value=Data.REFERENCIA_TRANSACCION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_CREA_TRANS",Value=Data.USUARIO_CREA_TRANS,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_CREA_TRANS",Value=Data.ESTACION_CREA_TRANS,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA_TRANS",Value=Data.FECHA_CREA_TRANS,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="USUARIO_ACTU_TRANS",Value=Data.USUARIO_ACTU_TRANS,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_ACTU_TRANS",Value=Data.ESTACION_ACTU_TRANS,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU_TRANS",Value=Data.FECHA_ACTU_TRANS,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="USUARIO_CREA_BITACORA",Value=Data.USUARIO_CREA_BITACORA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_CREA_BITACORA",Value=Data.ESTACION_CREA_BITACORA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA_BITACORA",Value=Data.FECHA_CREA_BITACORA,DbType=System.Data.DbType.DateTime},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Insert(_TableName,p,"CORR_BITACORA",pWhere);
				var response = new List<COM_BITACORAView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_BITACORA;
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
		
		public async Task<CResult> UpdateAsync(COM_BITACORATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="FECHA_BITACORA",Value=Data.FECHA_BITACORA,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="CODIGO_OPCION",Value=Data.CODIGO_OPCION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CLASE_BITACORA",Value=Data.CLASE_BITACORA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="LLAVE_TRANSACCION",Value=Data.LLAVE_TRANSACCION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="REFERENCIA_TRANSACCION",Value=Data.REFERENCIA_TRANSACCION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_CREA_TRANS",Value=Data.USUARIO_CREA_TRANS,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_CREA_TRANS",Value=Data.ESTACION_CREA_TRANS,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA_TRANS",Value=Data.FECHA_CREA_TRANS,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="USUARIO_ACTU_TRANS",Value=Data.USUARIO_ACTU_TRANS,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_ACTU_TRANS",Value=Data.ESTACION_ACTU_TRANS,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU_TRANS",Value=Data.FECHA_ACTU_TRANS,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="USUARIO_CREA_BITACORA",Value=Data.USUARIO_CREA_BITACORA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_CREA_BITACORA",Value=Data.ESTACION_CREA_BITACORA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA_BITACORA",Value=Data.FECHA_CREA_BITACORA,DbType=System.Data.DbType.DateTime},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_BITACORA",Value=Data.CORR_BITACORA,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<COM_BITACORAView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_BITACORA;
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
		
		public async Task<CResult> DeleteAsync(COM_BITACORATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_BITACORA",Value=Data.CORR_BITACORA,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_BITACORA;
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
