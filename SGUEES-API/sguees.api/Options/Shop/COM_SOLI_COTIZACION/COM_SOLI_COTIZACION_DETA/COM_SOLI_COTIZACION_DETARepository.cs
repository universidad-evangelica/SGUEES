using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public class COM_SOLI_COTIZACION_DETARepository: BaseRepository<COM_SOLI_COTIZACION_DETATable>, ICOM_SOLI_COTIZACION_DETARepository
	{
		private const string _TableName = "COM_SOLI_COTIZACION_DETA";
		
		public COM_SOLI_COTIZACION_DETARepository(IConfiguration config) : 
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
				var response = new List<COM_SOLI_COTIZACION_DETAView>().FromDataReader(reader).ToList();
				
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
				var response = new List<COM_SOLI_COTIZACION_DETAView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_SOLI_COTIZACION_DETA",Value=Data.CORR_SOLI_COTIZACION_DETA,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new() {ParameterName="ANIO_PERIODO_SOLI_COMPRA",Value=Data.ANIO_PERIODO_SOLI_COMPRA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_SOLI_COMPRA",Value=Data.CORR_SOLI_COMPRA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CODIGO_ITEM",Value=Data.CODIGO_ITEM,DbType=System.Data.DbType.String},
					new() {ParameterName="CANTIDAD",Value=Data.CANTIDAD,DbType=System.Data.DbType.Decimal},
					new() {ParameterName="CORR_UNIDAD_MEDIDA",Value=Data.CORR_UNIDAD_MEDIDA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
					new() {ParameterName="ESTADO_SOLI_COTIZACION",Value=Data.ESTADO_SOLI_COTIZACION,DbType=System.Data.DbType.String},
					new() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
					new() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
					new() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
					new() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
					new() {ParameterName="PRECIO_UNITARIO",Value=Data.PRECIO_UNITARIO,DbType=System.Data.DbType.Decimal},
					new() {ParameterName="MONTO_SUBTOTAL",Value=Data.MONTO_SUBTOTAL,DbType=System.Data.DbType.Decimal}
				};
				
				var pWhere = new List<CParameter>
				{
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Insert(_TableName,p,"CORR_SOLI_COTIZACION_DETA",pWhere);
				var response = new List<COM_SOLI_COTIZACION_DETAView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_SOLI_COTIZACION_DETA;
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
		
		public async Task<CResult> UpdateAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new() {ParameterName="ANIO_PERIODO_SOLI_COMPRA",Value=Data.ANIO_PERIODO_SOLI_COMPRA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_SOLI_COMPRA",Value=Data.CORR_SOLI_COMPRA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CODIGO_ITEM",Value=Data.CODIGO_ITEM,DbType=System.Data.DbType.String},
					new() {ParameterName="CANTIDAD",Value=Data.CANTIDAD,DbType=System.Data.DbType.Decimal},
					new() {ParameterName="CORR_UNIDAD_MEDIDA",Value=Data.CORR_UNIDAD_MEDIDA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
					new() {ParameterName="ESTADO_SOLI_COTIZACION",Value=Data.ESTADO_SOLI_COTIZACION,DbType=System.Data.DbType.String},
					new() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
					new() {ParameterName="PRECIO_UNITARIO",Value=Data.PRECIO_UNITARIO,DbType=System.Data.DbType.Decimal},
					new() {ParameterName="MONTO_SUBTOTAL",Value=Data.MONTO_SUBTOTAL,DbType=System.Data.DbType.Decimal}
				};
				
				var pWhere = new List<CParameter>
				{
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_SOLI_COTIZACION_DETA",Value=Data.CORR_SOLI_COTIZACION_DETA,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<COM_SOLI_COTIZACION_DETAView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_SOLI_COTIZACION_DETA;
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
		
		public async Task<CResult> DeleteAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION_DETA",Value=Data.CORR_SOLI_COTIZACION_DETA,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_SOLI_COTIZACION_DETA;
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
	
		public async Task<CResult> AnularAsync(COM_SOLI_COTIZACION_DETATable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "@CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "@CORR_SOLI_COTIZACION_DETA", Value = Data.CORR_SOLI_COTIZACION_DETA, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_COM_SOLI_COTIZACION_DETA_ANULAR",true,p);

				Data.CORR_SOLI_COTIZACION_DETA = (int)objData.objCommand.Parameters["@CORR_SOLI_COTIZACION_DETA"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });
					
					var readerGet = await objData.GetDataReader("V_COM_SOLI_COTIZACION", xWhere);
					var response = new List<COM_SOLI_COTIZACIONView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_SOLI_COTIZACION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_SOLI_COTIZACION_DETA"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(AnularDeta)";
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

	}
}
