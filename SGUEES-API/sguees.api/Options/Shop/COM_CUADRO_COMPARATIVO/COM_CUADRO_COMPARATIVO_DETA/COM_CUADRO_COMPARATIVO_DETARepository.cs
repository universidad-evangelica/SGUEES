using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class COM_CUADRO_COMPARATIVO_DETARepository: BaseRepository<COM_CUADRO_COMPARATIVO_DETATable>, ICOM_CUADRO_COMPARATIVO_DETARepository
	{
		private const string _TableName = "COM_CUADRO_COMPARATIVO_DETA";
		
		public COM_CUADRO_COMPARATIVO_DETARepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_COM_CUADRO_COMPARATIVO_DETA_SUM", xWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_DETAView>().FromDataReader(reader).ToList();
				
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
				var response = new List<COM_CUADRO_COMPARATIVO_DETAView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO_COTIZACION",Value=Data.ANIO_PERIODO_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_COTIZACION",Value=Data.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_COTIZACION_DETA",Value=Data.CORR_COTIZACION_DETA,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="SELECCION",Value=Data.SELECCION,DbType=System.Data.DbType.Boolean},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO_COTIZACION",Value=Data.ANIO_PERIODO_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_COTIZACION",Value=Data.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Insert(_TableName,p,"CORR_COTIZACION_DETA",pWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_DETAView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_COTIZACION_DETA;
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
		
		public async Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="SELECCION",Value=Data.SELECCION,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO_COTIZACION",Value=Data.ANIO_PERIODO_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_COTIZACION",Value=Data.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_COTIZACION_DETA",Value=Data.CORR_COTIZACION_DETA,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_DETAView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_COTIZACION_DETA;
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

		public async Task<CResult> UpdateCOM_CUADRO_COMPARATIVO_DETAAsync(COM_CUADRO_COMPARATIVO_DETA_UPDATEDTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CODIGO_ITEM",Value=Data.CODIGO_ITEM,DbType=System.Data.DbType.String},
					new() {ParameterName="SELECCION",Value=Data.SELECCION,DbType=System.Data.DbType.String},
				};
				
				var vQry = @$"
							  UPDATE A SET A.SELECCION=0 
							  FROM dbo.COM_CUADRO_COMPARATIVO_DETA A
							  INNER JOIN dbo.COM_COTIZACION_DETA B ON B.CORR_EMPRESA = A.CORR_EMPRESA AND B.ANIO_PERIODO = A.ANIO_PERIODO_COTIZACION AND B.CORR_COTIZACION = A.CORR_COTIZACION AND B.CORR_COTIZACION_DETA = A.CORR_COTIZACION_DETA
							  INNER JOIN dbo.COM_COTIZACION C ON C.CORR_EMPRESA = B.CORR_EMPRESA AND C.ANIO_PERIODO = B.ANIO_PERIODO AND C.CORR_COTIZACION = B.CORR_COTIZACION
							  WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							  AND A.CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO
							  AND B.CODIGO_ITEM=@CODIGO_ITEM

							  UPDATE A SET A.SELECCION=@SELECCION 
							  FROM dbo.COM_CUADRO_COMPARATIVO_DETA A
							  INNER JOIN dbo.COM_COTIZACION_DETA B ON B.CORR_EMPRESA = A.CORR_EMPRESA AND B.ANIO_PERIODO = A.ANIO_PERIODO_COTIZACION AND B.CORR_COTIZACION = A.CORR_COTIZACION AND B.CORR_COTIZACION_DETA = A.CORR_COTIZACION_DETA
							  INNER JOIN dbo.COM_COTIZACION C ON C.CORR_EMPRESA = B.CORR_EMPRESA AND C.ANIO_PERIODO = B.ANIO_PERIODO AND C.CORR_COTIZACION = B.CORR_COTIZACION
							  WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							  AND A.CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO
							  AND C.CORR_PROVEEDOR=@CORR_PROVEEDOR
							  AND B.CODIGO_ITEM=@CODIGO_ITEM";

				var reader1 =  await objData.GetDataReader(System.Data.CommandType.Text, vQry, pWhere);
				reader1.Close();
				reader1 = null;

				var xWhere = new List<CParameter>
				{
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				};

				var reader = await objData.GetDataReader("V_COM_CUADRO_COMPARATIVO_DETA_SUM", xWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_DETAView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_COTIZACION_DETA;
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
		
		public async Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO_COTIZACION",Value=Data.ANIO_PERIODO_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_COTIZACION",Value=Data.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_COTIZACION_DETA",Value=Data.CORR_COTIZACION_DETA,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_COTIZACION_DETA;
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
