using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public class COM_SOLI_COTIZACIONRepository: BaseRepository<COM_SOLI_COTIZACIONTable>, ICOM_SOLI_COTIZACIONRepository
	{
		private const string _TableName = "COM_SOLI_COTIZACION";
		
		public COM_SOLI_COTIZACIONRepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var sql = $@"SELECT *
							FROM V_{_TableName} A
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							AND A.FECHA_SOLI_COTIZACION>=@FECHA_INICIAL
							AND A.FECHA_SOLI_COTIZACION<=@FECHA_FINAL
							ORDER BY A.FECHA_SOLI_COTIZACION DESC";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text,sql,xWhere);
				var response = new List<COM_SOLI_COTIZACIONView>().FromDataReader(reader).ToList();
				
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
				var response = new List<COM_SOLI_COTIZACIONView>().FromDataReader(reader).FirstOrDefault();
				
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

		public async Task<CResult> GetAllSOLICITUD_COMPRAS_DISPONIBLE(List<CParameter> xWhere)
		{
			CResult objResultado = new();
	
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_SOLI_COMPRA_DISPONIBLE", xWhere);
				var response = new List<COM_SOLI_COMPRAView>().FromDataReader(reader);

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
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
		
		public async Task<CResult> GetAllSOLICITUD_COMPRAS_DETA_DISPONIBLE(List<CParameter> xWhere)
		{
			CResult objResultado = new();
	
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_SOLI_COMPRA_DISPONIBLE", xWhere);
				var response = new List<COM_SOLI_COTIZACION_DETAView>().FromDataReader(reader);

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
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

		public async Task<CResult> CreateAsync(COM_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new() {ParameterName="FECHA_SOLI_COTIZACION",Value=Data.FECHA_SOLI_COTIZACION,DbType=System.Data.DbType.DateTime},
					new() {ParameterName="FECHA_LIMITE_COTIZACION",Value=Data.FECHA_LIMITE_COTIZACION,DbType=System.Data.DbType.DateTime},
					new() {ParameterName="CODIGO_DEPTO",Value=Data.CODIGO_DEPTO,DbType=System.Data.DbType.String},
					new() {ParameterName="USUARIO_SOLI",Value=Data.USUARIO_SOLI,DbType=System.Data.DbType.String},
					new() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
					new() {ParameterName="ESTADO_SOLI_COTIZACION",Value=Data.ESTADO_SOLI_COTIZACION,DbType=System.Data.DbType.String},
					new() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
					new() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
					new() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
					new() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
					new() {ParameterName="CORR_TIPO_SOLI_COTIZA",Value=Data.CORR_TIPO_SOLI_COTIZA,DbType=System.Data.DbType.Int32},
				};
				
				var pWhere = new List<CParameter>
				{
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Insert(_TableName,p,"CORR_SOLI_COTIZACION",pWhere);
				var response = new List<COM_SOLI_COTIZACIONView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_SOLI_COTIZACION;
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

		// public async Task<CResult> CreateEncaDetaAsync(COM_SOLI_COTIZACION_ENCA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		// {
		// 	CResult objResultado = new();
			
		// 	try
		// 	{
		// 		var p = new List<CParameter>
		// 		{
		// 			new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
		// 			new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
		// 			new() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
		// 			new() {ParameterName="FECHA_SOLI_COTIZACION",Value=Data.FECHA_SOLI_COTIZACION,DbType=System.Data.DbType.DateTime},
		// 			new() {ParameterName="FECHA_LIMITE_COTIZACION",Value=Data.FECHA_LIMITE_COTIZACION,DbType=System.Data.DbType.DateTime},
		// 			new() {ParameterName="CODIGO_DEPTO",Value=Data.CODIGO_DEPTO,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="USUARIO_SOLI",Value=Data.USUARIO_SOLI,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="ESTADO_SOLI_COTIZACION",Value=Data.ESTADO_SOLI_COTIZACION,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
		// 			new() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
		// 			new() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
		// 		};
				
		// 		var pWhere = new List<CParameter>
		// 		{
		// 			new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
		// 			new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
		// 		};
				
		// 		var reader = await objData.Insert(_TableName,p,"CORR_SOLI_COTIZACION",pWhere);
		// 		var response = new List<COM_SOLI_COTIZACIONView>().FromDataReader(reader).FirstOrDefault();

		// 		reader.Close();
		// 		reader = null;
				
		// 		if(response.CORR_SOLI_COTIZACION > 0 )
		// 		{
		// 			Data.CORR_SOLI_COTIZACION = response.CORR_SOLI_COTIZACION;

		// 			foreach (var Detalle in Data.DETA)
    //       {
		// 				try
		// 				{
		// 					var parametros = new List<CParameter>
		// 					{
		// 						new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="CORR_SOLI_COTIZACION_DETA",Value=Detalle.CORR_SOLI_COTIZACION_DETA,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
		// 						new() {ParameterName="CODIGO_ITEM",Value=Detalle.CODIGO_ITEM,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="CANTIDAD",Value=Detalle.CANTIDAD,DbType=System.Data.DbType.Decimal},
		// 						new() {ParameterName="CORR_UNIDAD_MEDIDA",Value=Detalle.CORR_UNIDAD_MEDIDA,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="OBSERVACIONES",Value=Detalle.OBSERVACIONES,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="ESTADO_SOLI_COTIZACION",Value=Detalle.ESTADO_SOLI_COTIZACION,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
		// 						new() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
		// 						new() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
		// 					};

		// 					var pWhereDeta = new List<CParameter>
		// 					{
		// 						new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
		// 					};

		// 					var readerDeta = await objData.Insert(_TableName+"_DETA",parametros,"CORR_SOLI_COTIZACION_DETA",pWhereDeta);
		// 					var responseDeta = new List<COM_SOLI_COTIZACION_DETAView>().FromDataReader(readerDeta).FirstOrDefault();

		// 					readerDeta.Close();
		// 					responseDeta = null;

		// 					objResultado.Data = responseDeta;
		// 					objResultado.Result = true;
		// 					objResultado.RowsAffected = 1;
		// 					objResultado.CodeHelper = responseDeta.CORR_SOLI_COTIZACION_DETA;
		// 					objResultado.ErrorCode = 0;
		// 					objResultado.ErrorMessage = "";
		// 					objResultado.ErrorSource ="";
		// 				}
		// 				catch (System.Exception e)
		// 				{
		// 					objResultado.Data = null;
		// 					objResultado.Result = false;
		// 					objResultado.CodeHelper = 0;
		// 					objResultado.ErrorCode =  -1;
		// 					objResultado.ErrorMessage = e.Message;
		// 					objResultado.ErrorSource += $"[{e.Source}]";
		// 				}
		// 			}
		// 		}

		// 		objResultado.Data = response;
		// 		objResultado.Result = true;
		// 		objResultado.RowsAffected = 1;
		// 		objResultado.CodeHelper = response.CORR_SOLI_COTIZACION;
		// 		objResultado.ErrorCode = 0;
		// 		objResultado.ErrorMessage = "";
		// 		objResultado.ErrorSource ="";
		// 	}
		// 	catch (System.Exception e)
		// 	{
		// 		objResultado.Data = null;
		// 		objResultado.Result = false;
		// 		objResultado.CodeHelper = 0;
		// 		objResultado.ErrorCode =  -1;
		// 		objResultado.ErrorMessage = e.Message;
		// 		objResultado.ErrorSource += $"[{e.Source}]";
		// 	}
		// 	finally
		// 	{
		// 		objData.objConnection.Close();
		// 	}
			
		// 	return objResultado;
		// }

		// public async Task<CResult> UpdateEncaDetaAsync(COM_SOLI_COTIZACION_ENCA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		// {
		// 	CResult objResultado = new();
			
		// 	try
		// 	{
		// 		var p = new List<CParameter>
		// 		{
		// 			new() {ParameterName="FECHA_SOLI_COTIZACION",Value=Data.FECHA_SOLI_COTIZACION,DbType=System.Data.DbType.DateTime},
		// 			new() {ParameterName="FECHA_LIMITE_COTIZACION",Value=Data.FECHA_LIMITE_COTIZACION,DbType=System.Data.DbType.DateTime},
		// 			new() {ParameterName="CODIGO_DEPTO",Value=Data.CODIGO_DEPTO,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="ANIO_PERIODO_SOLI_COMPRA",Value=Data.ANIO_PERIODO_SOLI_COMPRA,DbType=System.Data.DbType.Int32},
		// 			new() {ParameterName="CORR_SOLI_COMPRA",Value=Data.CORR_SOLI_COMPRA,DbType=System.Data.DbType.Int32},
		// 			new() {ParameterName="USUARIO_SOLI",Value=Data.USUARIO_SOLI,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="ESTADO_SOLI_COTIZACION",Value=Data.ESTADO_SOLI_COTIZACION,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
		// 			new() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
		// 			new() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
		// 		};
				
		// 		var pWhere = new List<CParameter>
		// 		{
		// 			new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
		// 			new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
		// 			new() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
		// 		};
				
		// 		var reader = await objData.Update(_TableName,p,pWhere);
		// 		var response = new List<COM_SOLI_COTIZACIONView>().FromDataReader(reader).FirstOrDefault();

		// 		reader.Close();
		// 		reader = null;
				
		// 		if(response.CORR_SOLI_COTIZACION > 0 )
		// 		{
		// 			Data.CORR_SOLI_COTIZACION = response.CORR_SOLI_COTIZACION;

		// 			foreach (var Detalle in Data.DETA)
    //       {
		// 				try
		// 				{
		// 					var parametros = new List<CParameter>
		// 					{
		// 						new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="CORR_SOLI_COTIZACION_DETA",Value=Detalle.CORR_SOLI_COTIZACION_DETA,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
		// 						new() {ParameterName="CODIGO_ITEM",Value=Detalle.CODIGO_ITEM,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="CANTIDAD",Value=Detalle.CANTIDAD,DbType=System.Data.DbType.Decimal},
		// 						new() {ParameterName="CORR_UNIDAD_MEDIDA",Value=Detalle.CORR_UNIDAD_MEDIDA,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="OBSERVACIONES",Value=Detalle.OBSERVACIONES,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="ESTADO_SOLI_COTIZACION",Value=Detalle.ESTADO_SOLI_COTIZACION,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
		// 						new() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
		// 						new() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
		// 						new() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
		// 					};

		// 					var pWhereDeta = new List<CParameter>
		// 					{
		// 						new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
		// 						new() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
		// 					};

		// 					var readerDeta = await objData.Insert(_TableName+"_DETA",parametros,"CORR_SOLI_COTIZACION_DETA",pWhereDeta);
		// 					var responseDeta = new List<COM_SOLI_COTIZACION_DETAView>().FromDataReader(readerDeta).FirstOrDefault();

		// 					readerDeta.Close();
		// 					responseDeta = null;
		// 				}
		// 				catch (System.Exception e)
		// 				{
		// 					objResultado.Data = null;
		// 					objResultado.Result = false;
		// 					objResultado.CodeHelper = 0;
		// 					objResultado.ErrorCode =  -1;
		// 					objResultado.ErrorMessage = e.Message;
		// 					objResultado.ErrorSource += $"[{e.Source}]";
		// 				}
		// 			}
		// 		}

		// 		objResultado.Data = response;
		// 		objResultado.Result = true;
		// 		objResultado.RowsAffected = 1;
		// 		objResultado.CodeHelper = response.CORR_SOLI_COTIZACION;
		// 		objResultado.ErrorCode = 0;
		// 		objResultado.ErrorMessage = "";
		// 		objResultado.ErrorSource ="";
		// 	}
		// 	catch (System.Exception e)
		// 	{
		// 		objResultado.Data = null;
		// 		objResultado.Result = false;
		// 		objResultado.CodeHelper = 0;
		// 		objResultado.ErrorCode =  -1;
		// 		objResultado.ErrorMessage = e.Message;
		// 		objResultado.ErrorSource += $"[{e.Source}]";
		// 	}
		// 	finally
		// 	{
		// 		objData.objConnection.Close();
		// 	}
			
		// 	return objResultado;
		// }
		
		public async Task<CResult> UpdateAsync(COM_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new() {ParameterName="FECHA_SOLI_COTIZACION",Value=Data.FECHA_SOLI_COTIZACION,DbType=System.Data.DbType.DateTime},
					new() {ParameterName="FECHA_LIMITE_COTIZACION",Value=Data.FECHA_LIMITE_COTIZACION,DbType=System.Data.DbType.DateTime},
					new() {ParameterName="CODIGO_DEPTO",Value=Data.CODIGO_DEPTO,DbType=System.Data.DbType.String},
					new() {ParameterName="USUARIO_SOLI",Value=Data.USUARIO_SOLI,DbType=System.Data.DbType.String},
					new() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
					new() {ParameterName="ESTADO_SOLI_COTIZACION",Value=Data.ESTADO_SOLI_COTIZACION,DbType=System.Data.DbType.String},
					new() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
					new() {ParameterName="CORR_TIPO_SOLI_COTIZA",Value=Data.CORR_TIPO_SOLI_COTIZA,DbType=System.Data.DbType.Int32},
				};
				
				var pWhere = new List<CParameter>
				{
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<COM_SOLI_COTIZACIONView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_SOLI_COTIZACION;
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
		
		public async Task<CResult> DeleteAsync(COM_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
				};

				if (Data.CORR_SOLI_COTIZACION > 0)
				{
					await objData.Delete(_TableName+"_DOC",pWhere);
					await objData.Delete(_TableName+"_DETA_DOC",pWhere);
					await objData.Delete(_TableName+"_DETA",pWhere);
					await objData.Delete(_TableName+"_PROVEEDOR",pWhere);
				}
				if (Data.CORR_SOLI_COTIZACION > 0)
				{
					await CreateBitacoraAsync(Data, vLOGIN_SISTEMA, vESTACION);
					objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.CodeHelper = Data.CORR_SOLI_COTIZACION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource ="";
				} else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.CodeHelper = Data.CORR_SOLI_COTIZACION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "No se puede eliminar la solicitud";
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

		public async Task<CResult> SolicitarAsync(COM_SOLI_COTIZACIONTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_COM_SOLI_COTIZACION_SOLICITAR",true,p);

				Data.CORR_SOLI_COTIZACION = (int)objData.objCommand.Parameters["CORR_SOLI_COTIZACION"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
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
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["CORR_SOLI_COTIZACION"].Value;
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

		public async Task<CResult> GetComSoliCotizacionImpr(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_COM_SOLI_COTIZACION_IMPR", xWhere);
				var response = new List<COM_SOLI_COTIZACION_IMPRView>().FromDataReader(reader);

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
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
	
		public async Task<CResult> AnularAsync(COM_SOLI_COTIZACIONTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "@CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_COM_SOLI_COTIZACION_ANULAR",true,p);

				Data.CORR_SOLI_COTIZACION = (int)objData.objCommand.Parameters["@CORR_SOLI_COTIZACION"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
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
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_SOLI_COTIZACION"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(Anular)";
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

		public async Task<CResult> AplicarAsync(COM_SOLI_COTIZACIONTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "@CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_COM_SOLI_COTIZACION_APLICAR",true,p);

				Data.CORR_SOLI_COTIZACION = (int)objData.objCommand.Parameters["@CORR_SOLI_COTIZACION"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
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
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_SOLI_COTIZACION"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(Aplicar)";
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

		public async Task<CResult> GetAllCotizacionesAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var sql = $@"SELECT *
										FROM V_COM_COTIZACION A
										WHERE A.CORR_EMPRESA=@CORR_EMPRESA
										AND A.ANIO_PERIODO_SOLI_COTI=@ANIO_PERIODO
										AND A.CORR_SOLI_COTIZACION=@CORR_SOLI_COTIZACION
										AND A.ESTADO_COTIZACION='SO'
										";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text,sql,xWhere);
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
		public async Task<CResult> CreateBitacoraAsync(COM_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="JUSTIFICACION_ELIMINAR",Value=Data.JUSTIFICACION_ELIMINAR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="SYS_LOGIN_USUARIO",Value=vLOGIN_SISTEMA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="SYS_ESTACION",Value=vESTACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() {ParameterName="SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() {ParameterName="SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 }

				};
				
				var sql = @$"

							DECLARE @ANIO_PERIODO_BITACORA INT=YEAR(GETDATE()),@CORR_BITACORA_TRANS INT=0, @FECHA_BITACORA DATE=GETDATE(), @LLAVE_TRANSACCION VARCHAR(250),@REFERENCIA_TRANSACCION VARCHAR(500), 
							@USUARIO_CREA_TRANS VARCHAR(50), @ESTACION_CREA_TRANS VARCHAR(50), @FECHA_CREA_TRANS DATETIME,@USUARIO_ACTU_TRANS VARCHAR(50), @ESTACION_ACTU_TRANS VARCHAR(50),
							@FECHA_ACTU_TRANS DATETIME, @USUARIO_CREA_BITACORA VARCHAR(50),@ESTACION_CREA_BITACORA VARCHAR(50), @FECHA_CREA_BITACORA DATETIME=GETDATE(),
							@CODIGO_OPCION VARCHAR(150)='COM_SOLI_COTIZACION',@CLASE_BITACORA VARCHAR(3)='EL'

							------------------------------------------------------------------------
							-------------  BITACORA -------------- 
							SELECT @LLAVE_TRANSACCION='Año: '+CONVERT(VARCHAR,A.ANIO_PERIODO) COLLATE DATABASE_DEFAULT+' Correlativo No.: '+CONVERT(VARCHAR,A.CORR_SOLI_COTIZACION) COLLATE DATABASE_DEFAULT,
									@REFERENCIA_TRANSACCION= ' Fecha: '+ CONVERT(VARCHAR,A.FECHA_SOLI_COTIZACION) COLLATE DATABASE_DEFAULT
															+', Departemento: '+A.NOMBRE_DEPTO COLLATE DATABASE_DEFAULT
															+', Proveedor: '+ISNULL(A.NOMBRE_PROVEEDOR,'') COLLATE DATABASE_DEFAULT
															+', Observaciones: '+ISNULL(A.OBSERVACIONES,'') COLLATE DATABASE_DEFAULT
															+', Justificación Elminación: '+@JUSTIFICACION_ELIMINAR,
									@USUARIO_CREA_TRANS=A.USUARIO_CREA, @ESTACION_CREA_TRANS=A.ESTACION_CREA, @FECHA_CREA_TRANS=A.FECHA_CREA,
									@USUARIO_ACTU_TRANS=A.USUARIO_ACTU, @ESTACION_ACTU_TRANS=A.ESTACION_ACTU, @FECHA_ACTU_TRANS=A.FECHA_ACTU
							FROM V_COM_SOLI_COTIZACION A
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							AND A.ANIO_PERIODO=@ANIO_PERIODO
							AND A.CORR_SOLI_COTIZACION=@CORR_SOLI_COTIZACION

							--Executando el procedimiento de la bitacora
							EXECUTE PRAL_MTTO_COM_BITACORA
							1,--@TIPO_ACTUALIZA ,                              
							@CORR_EMPRESA ,
							@ANIO_PERIODO_BITACORA,
							@CORR_BITACORA_TRANS  OUTPUT,
							@FECHA_BITACORA ,                    
							@CODIGO_OPCION,                               
							@CLASE_BITACORA ,                              
							@LLAVE_TRANSACCION ,                           
							@REFERENCIA_TRANSACCION ,                      
							@USUARIO_CREA_TRANS ,                          
							@ESTACION_CREA_TRANS,                         
							@FECHA_CREA_TRANS ,         
							@USUARIO_ACTU_TRANS ,                          
							@ESTACION_ACTU_TRANS ,                         
							@FECHA_ACTU_TRANS ,         
							@SYS_LOGIN_USUARIO, --@USUARIO_CREA_BITACORA
							@SYS_ESTACION, --@ESTACION_CREA_BITACORA                      
							@FECHA_CREA_BITACORA ,      
							@SYS_LOGIN_USUARIO,                           
							@SYS_ESTACION ,                                
							@SYS_FILAS_AFECTADAS OUTPUT,
							@SYS_NUMERO_ERROR  OUTPUT,      
							@SYS_MENSAJE_ERROR  OUTPUT";
				var vResultado = await objData.ExecCmd(System.Data.CommandType.Text, sql, true, pWhere);

				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = Data.CORR_SOLI_COTIZACION;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";

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
