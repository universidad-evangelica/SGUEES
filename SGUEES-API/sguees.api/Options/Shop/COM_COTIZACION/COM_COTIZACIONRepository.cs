using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public class COM_COTIZACIONRepository: BaseRepository<COM_COTIZACIONTable>, ICOM_COTIZACIONRepository
	{
		private const string _TableName = "COM_COTIZACION";
		
		public COM_COTIZACIONRepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure,"PRAL_DATA_COM_COTIZACION", xWhere);
				var response = new List<COM_COTIZACIONView>().FromDataReader(reader).ToList();
				
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
				var response = new List<COM_COTIZACIONView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(COM_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_COTIZACION",Value=Data.CORR_COTIZACION,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="FECHA_COTIZACION",Value=Data.FECHA_COTIZACION,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="USUARIO_COTIZA",Value=Data.USUARIO_COTIZA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="OBSERVACIONES_PROVEEDOR",Value=Data.OBSERVACIONES_PROVEEDOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="PLAZO_ENTREGA",Value=Data.PLAZO_ENTREGA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_COTIZACION",Value=Data.ESTADO_COTIZACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ANIO_PERIODO_SOLI_COTI",Value=Data.ANIO_PERIODO_SOLI_COTI,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CONDICION_PAGO",Value=Data.CORR_CONDICION_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_FORMA_PAGO",Value=Data.CORR_FORMA_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="DETALLE_FORMA_PAGO",Value=Data.DETALLE_FORMA_PAGO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Insert(_TableName,p,"CORR_COTIZACION",pWhere);
				var response = new List<COM_COTIZACIONView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_COTIZACION;
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
		
		public async Task<CResult> UpdateAsync(COM_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="FECHA_COTIZACION",Value=Data.FECHA_COTIZACION,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="USUARIO_COTIZA",Value=Data.USUARIO_COTIZA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="OBSERVACIONES_PROVEEDOR",Value=Data.OBSERVACIONES_PROVEEDOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="PLAZO_ENTREGA",Value=Data.PLAZO_ENTREGA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_COTIZACION",Value=Data.ESTADO_COTIZACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ANIO_PERIODO_SOLI_COTI",Value=Data.ANIO_PERIODO_SOLI_COTI,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CONDICION_PAGO",Value=Data.CORR_CONDICION_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_FORMA_PAGO",Value=Data.CORR_FORMA_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="DETALLE_FORMA_PAGO",Value=Data.DETALLE_FORMA_PAGO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_COTIZACION",Value=Data.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<COM_COTIZACIONView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_COTIZACION;
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
		
		public async Task<CResult> DeleteAsync(COM_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_COTIZACION",Value=Data.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
				};

				if (Data.CORR_COTIZACION > 0)
				{
					await objData.Delete(_TableName+"_DETA",pWhere);
				}
				if (Data.CORR_COTIZACION > 0)
				{
					objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.CodeHelper = Data.CORR_COTIZACION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource ="";
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

		public async Task<CResult> AplicarAsync(COM_COTIZACIONTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "CORR_COTIZACION", Value = Data.CORR_COTIZACION, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_COM_COTIZACION_APLICAR",true,p);

				Data.CORR_SOLI_COTIZACION = (int)objData.objCommand.Parameters["CORR_COTIZACION"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_COTIZACION", Value = Data.CORR_COTIZACION, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_COTIZACIONView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_COTIZACION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["CORR_COTIZACION"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
				}
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}
	
		public async Task<CResult> GetComCotizacionRepoAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure,"PRAL_DATA_COM_COTIZACION", xWhere);
				var response = new List<COM_COTIZACION_CONSULTAView>().FromDataReader(reader).ToList();
				
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
		
		public async Task<CResult> GetCorreoCotizaAplicarAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_COM_COTIZACION_APLICA_CORREO", xWhere);
				var response = new List<COM_COTIZACION_CORREOView>().FromDataReader(reader).FirstOrDefault();
				
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
	}
}
