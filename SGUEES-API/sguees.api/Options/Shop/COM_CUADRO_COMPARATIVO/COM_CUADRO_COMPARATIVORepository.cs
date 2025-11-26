using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public class COM_CUADRO_COMPARATIVORepository: BaseRepository<COM_CUADRO_COMPARATIVOTable>, ICOM_CUADRO_COMPARATIVORepository
	{
		private const string _TableName = "COM_CUADRO_COMPARATIVO";
		
		public COM_CUADRO_COMPARATIVORepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var vQry = @$"
								SELECT A.*
								FROM V_COM_CUADRO_COMPARATIVO A
								WHERE A.CORR_EMPRESA=@CORR_EMPRESA
								AND CONVERT(DATE,A.FECHA_CUADRO_COMPARATIVO)>=@FECHA_INICIAL
								AND CONVERT(DATE,A.FECHA_CUADRO_COMPARATIVO)<=@FECHA_FINAL
								ORDER BY CONVERT(DATE,A.FECHA_CUADRO_COMPARATIVO) DESC
							";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(reader).ToList();
				
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
				var response = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(reader).FirstOrDefault();
				
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
		public async Task<CResult> GetAllSOLICITUD_COTIZACION_DISPONIBLE(List<CParameter> xWhere)
		{
			CResult objResultado = new();
	
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_SOLI_COTIZACION_DISPONIBLE", xWhere);
				var response = new List<COM_SOLI_COTIZACION_DISPONIBLESView>().FromDataReader(reader);

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
		
		public async Task<CResult> GetAllSOLICITUD_COTIZACION_DETA_DISPONIBLE(List<CParameter> xWhere)
		{
			CResult objResultado = new();
	
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_SOLI_COTIZACION_DISPONIBLE", xWhere);
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

		public async Task<CResult> GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETAAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
	
			try
			{
				var vQry = @$"SELECT A.CORR_EMPRESA,
							  A.ANIO_PERIODO,
							  A.CORR_CUADRO_COMPARATIVO,
							 ROW_NUMBER() OVER(PARTITION BY A.CORR_EMPRESA,A.ANIO_PERIODO,A.CORR_CUADRO_COMPARATIVO ORDER BY A.CORR_EMPRESA,A.ANIO_PERIODO,A.CORR_CUADRO_COMPARATIVO) CORR_DETA,
							  A.CORR_COTIZACION,
							  ANIO_PERIODO_COTIZACION,
							  A.CORR_COTIZACION_DETA,
							  D.NOMBRE_PROVEEDOR,
							  A.SELECCION,
							  A.OBSERVACIONES,
							  B.CODIGO_ITEM,
							  B.NOMBRE_ITEM,
							  B.CANTIDAD,
							  B.CORR_UNIDAD_MEDIDA,
							  B.MARCA,
							  B.PRECIO_UNITARIO,
							  B.MONTO_SUBTOTAL
							  FROM dbo.COM_CUADRO_COMPARATIVO_DETA A
							  INNER JOIN dbo.V_COM_COTIZACION_DETA B ON B.CORR_EMPRESA = A.CORR_EMPRESA AND B.ANIO_PERIODO = A.ANIO_PERIODO_COTIZACION AND B.CORR_COTIZACION = A.CORR_COTIZACION AND B.CORR_COTIZACION_DETA = A.CORR_COTIZACION_DETA
							  INNER JOIN dbo.COM_COTIZACION C ON C.CORR_EMPRESA = B.CORR_EMPRESA AND C.ANIO_PERIODO = B.ANIO_PERIODO AND C.CORR_COTIZACION = B.CORR_COTIZACION
							  LEFT OUTER JOIN dbo.COM_PROVEEDOR D ON D.CORR_PROVEEDOR = C.CORR_PROVEEDOR
							  WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							  AND A.ANIO_PERIODO=@ANIO_PERIODO
							  AND A.CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO
										";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_COTIZACION_DETAView>().FromDataReader(reader).ToList();
				
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

		public async Task<CResult> getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var vQry = @$"SELECT *
										FROM V_COM_CUADRO_COMPARATIVO_PROVEEDOR A
										WHERE A.CORR_EMPRESA=@CORR_EMPRESA
										AND ANIO_PERIODO=@ANIO_PERIODO
										AND CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO
										";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_PROVEEDORView>().FromDataReader(reader).ToList();
				
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
		public async Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="FECHA_CUADRO_COMPARATIVO",Value=Data.FECHA_CUADRO_COMPARATIVO,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTADO_CUADRO_COMPARATIVO",Value=Data.ESTADO_CUADRO_COMPARATIVO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_CUADRO_COMPARATIVO",Value=Data.USUARIO_CUADRO_COMPARATIVO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ES_MEJOR_PRECIO",Value=Data.ES_MEJOR_PRECIO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_CREDITO_30_DIAS",Value=Data.TIENE_CREDITO_30_DIAS,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_BUEN_SOPORTE_TECNICO",Value=Data.TIENE_BUEN_SOPORTE_TECNICO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_BUENA_CALIDAD_PRODUCTO",Value=Data.TIENE_BUENA_CALIDAD_PRODUCTO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_MEJOR_TIEMPO_ENTREGA",Value=Data.TIENE_MEJOR_TIEMPO_ENTREGA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="BRINDA_BUENA_EXPERIENCIA_PROVEEDOR",Value=Data.BRINDA_BUENA_EXPERIENCIA_PROVEEDOR,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="ES_PROVEEDOR_UNICO",Value=Data.ES_PROVEEDOR_UNICO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="EXISTE_OTRA_RAZON",Value=Data.EXISTE_OTRA_RAZON,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="NOMBRE_OTRA_RAZON",Value=Data.NOMBRE_OTRA_RAZON,DbType=System.Data.DbType.String},
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
				
				var reader = await objData.Insert(_TableName,p,"CORR_CUADRO_COMPARATIVO",pWhere);
				var response = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="FECHA_CUADRO_COMPARATIVO",Value=Data.FECHA_CUADRO_COMPARATIVO,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTADO_CUADRO_COMPARATIVO",Value=Data.ESTADO_CUADRO_COMPARATIVO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_CUADRO_COMPARATIVO",Value=Data.USUARIO_CUADRO_COMPARATIVO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ES_MEJOR_PRECIO",Value=Data.ES_MEJOR_PRECIO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_CREDITO_30_DIAS",Value=Data.TIENE_CREDITO_30_DIAS,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_BUEN_SOPORTE_TECNICO",Value=Data.TIENE_BUEN_SOPORTE_TECNICO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_BUENA_CALIDAD_PRODUCTO",Value=Data.TIENE_BUENA_CALIDAD_PRODUCTO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_MEJOR_TIEMPO_ENTREGA",Value=Data.TIENE_MEJOR_TIEMPO_ENTREGA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="BRINDA_BUENA_EXPERIENCIA_PROVEEDOR",Value=Data.BRINDA_BUENA_EXPERIENCIA_PROVEEDOR,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="ES_PROVEEDOR_UNICO",Value=Data.ES_PROVEEDOR_UNICO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="EXISTE_OTRA_RAZON",Value=Data.EXISTE_OTRA_RAZON,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="NOMBRE_OTRA_RAZON",Value=Data.NOMBRE_OTRA_RAZON,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				};
				
				if (Data.CORR_CUADRO_COMPARATIVO > 0)
				{
					await objData.Delete(_TableName+"_DETA",pWhere);
					await objData.Delete("COM_CUADRO_COMPARATIVO_SOLI_COTIZACION",pWhere);
					await objData.Delete("COM_CUADRO_COMPARATIVO_DOC",pWhere);
					await objData.Delete("COM_CUADRO_COMPARATIVO_AUTORIZACIONES",pWhere);
					await objData.Delete("COM_CUADRO_COMPARATIVO_COMENTARIO",pWhere);
					await objData.Delete("COM_CUADRO_COMPARATIVO_ORDEN_COMPRA",pWhere);
				}
				if (Data.CORR_CUADRO_COMPARATIVO > 0)
				{
					await CreateBitacoraAsync(Data, vLOGIN_SISTEMA, vESTACION);
					objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.CodeHelper = Data.CORR_CUADRO_COMPARATIVO;
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

		public async Task<CResult> COM_CUADRO_COMPARATIVO_GENERAR(COM_CUADRO_COMPARATIVO_SOLI_COTIZACIONTable Data,string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="FECHA_CUADRO_COMPARATIVO",Value=Data.FECHA_CUADRO_COMPARATIVO,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTADO_CUADRO_COMPARATIVO",Value=Data.ESTADO_CUADRO_COMPARATIVO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_CUADRO_COMPARATIVO",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ES_MEJOR_PRECIO",Value=Data.ES_MEJOR_PRECIO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_CREDITO_30_DIAS",Value=Data.TIENE_CREDITO_30_DIAS,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_BUEN_SOPORTE_TECNICO",Value=Data.TIENE_BUEN_SOPORTE_TECNICO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_BUENA_CALIDAD_PRODUCTO",Value=Data.TIENE_BUENA_CALIDAD_PRODUCTO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_MEJOR_TIEMPO_ENTREGA",Value=Data.TIENE_MEJOR_TIEMPO_ENTREGA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="BRINDA_BUENA_EXPERIENCIA_PROVEEDOR",Value=Data.BRINDA_BUENA_EXPERIENCIA_PROVEEDOR,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="ES_PROVEEDOR_UNICO",Value=Data.ES_PROVEEDOR_UNICO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="EXISTE_OTRA_RAZON",Value=Data.EXISTE_OTRA_RAZON,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="NOMBRE_OTRA_RAZON",Value=Data.NOMBRE_OTRA_RAZON,DbType=System.Data.DbType.String},
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
				
				var readerEncabezado = await objData.Insert(_TableName,p,"CORR_CUADRO_COMPARATIVO",pWhere);
				var responseEncabezado = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(readerEncabezado).FirstOrDefault();

				readerEncabezado.Close();
				readerEncabezado = null;

				if(responseEncabezado.CORR_CUADRO_COMPARATIVO>0)
				{
					foreach (var Detalle in Data.SOLICITUDES)
                	{
						var pRelacion = new List<CParameter>
						{
							new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
							new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
							new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=responseEncabezado.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
							new CParameter() {ParameterName="ANIO_PERIODO_SOLI_COTI",Value=Detalle.ANIO_PERIODO_SOLI_COTI,DbType=System.Data.DbType.Int32},
							new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=Detalle.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
						};
						
						var pWhereRelacion = new List<CParameter>
						{
							new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
						};

						var readerRelacion = await objData.Insert("COM_CUADRO_COMPARATIVO_SOLI_COTIZACION",pRelacion,"",pWhereRelacion);
						//var responseRelacion = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(readerRelacion).FirstOrDefault();

						readerRelacion.Close();
						readerRelacion = null;
					}

					var pprocedimiento = new List<CParameter>();
					pprocedimiento.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					pprocedimiento.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
					pprocedimiento.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = responseEncabezado.CORR_CUADRO_COMPARATIVO , DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
					                //Parametros para gestionar la operación
					pprocedimiento.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String });
					pprocedimiento.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
					pprocedimiento.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
					pprocedimiento.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
					pprocedimiento.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });


					var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_GENE_COM_CUADRO_COMPARATIVO",true,pprocedimiento);

					Data.CORR_CUADRO_COMPARATIVO = (int)objData.objCommand.Parameters["CORR_CUADRO_COMPARATIVO"].Value;

					if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
					{
						var xWhere = new List<CParameter>();
						xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
						xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
						xWhere.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = Data.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 });

						var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
						var response = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(readerGet).FirstOrDefault();

						readerGet.Close();
						readerGet = null;

						objResultado.Data = response;
						objResultado.Result = true;
						objResultado.RowsAffected = 1;
						objResultado.CodeHelper = response.CORR_CUADRO_COMPARATIVO;
						objResultado.ErrorCode = 0;
						objResultado.ErrorMessage = "";
						objResultado.ErrorSource = "";
					}
					else
					{
						objResultado.Data = null;
						objResultado.Result = false;
						objResultado.RowsAffected = 0;
						objResultado.CodeHelper = (int)objData.objCommand.Parameters["CORR_CUADRO_COMPARATIVO"].Value;
						objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
						objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
						objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
					}
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
		public async Task<CResult> SolicitarAsync(COM_CUADRO_COMPARATIVOTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = Data.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });


				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_COM_CUADRO_COMPARATIVO_SOLICITAR",true,p);

				Data.CORR_CUADRO_COMPARATIVO = (int)objData.objCommand.Parameters["CORR_CUADRO_COMPARATIVO"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = Data.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_CUADRO_COMPARATIVO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["CORR_CUADRO_COMPARATIVO"].Value;
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
	
		public async Task<CResult> GetComCuadroComparativoImpr(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_IMPR_COM_CUADRO_COMPARATIVO", xWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_IMPRView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				reader=await objData.GetDataReader("V_COM_CUADRO_COMPARATIVO_TOTAL", xWhere,"CORR_PROVEEDOR");

				response[0].TOTAL_PROVEEDORES = new List<COM_CUADRO_COMPARATIVO_TOTAL_IMPRView>().FromDataReader(reader).ToList();
				
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

		public async Task<CResult> AplicarAsync(COM_CUADRO_COMPARATIVOTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "@CORR_CUADRO_COMPARATIVO", Value = Data.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_COM_CUADRO_COMPARATIVO_APLICAR",true,p);

				Data.CORR_CUADRO_COMPARATIVO = (int)objData.objCommand.Parameters["@CORR_CUADRO_COMPARATIVO"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = Data.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_CUADRO_COMPARATIVO;
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
	
		public async Task<CResult> GetAllSolicitadosAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
	
			try
			{
				var vQry = @$"  SELECT A.*
								,C.PERMITE_MODIFICAR
								FROM V_COM_CUADRO_COMPARATIVO A
								INNER JOIN COM_CUADRO_COMPARATIVO_AUTORIZACIONES C ON A.CORR_EMPRESA = C.CORR_EMPRESA AND C.LOGIN_SISTEMA=@SYS_LOGIN_USUARIO AND A.ANIO_PERIODO = C.ANIO_PERIODO AND A.CORR_CUADRO_COMPARATIVO = C.CORR_CUADRO_COMPARATIVO
								WHERE A.ESTADO_CUADRO_COMPARATIVO='SO'
								AND C.ESTADO_AUTORIZACION='SO'
								AND NOT EXISTS(SELECT 1 FROM COM_CUADRO_COMPARATIVO_AUTORIZACIONES D
												WHERE D.CORR_EMPRESA=C.CORR_EMPRESA
												AND D.LOGIN_SISTEMA<>@SYS_LOGIN_USUARIO
												AND D.ANIO_PERIODO=C.ANIO_PERIODO
												AND D.CORR_CUADRO_COMPARATIVO=C.CORR_CUADRO_COMPARATIVO
												AND D.ORDEN_REVISION<C.ORDEN_REVISION
												AND D.ESTADO_AUTORIZACION='SO')
										";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(reader).ToList();
				
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
		public async Task<CResult> AutorizarAsync(COM_CUADRO_COMPARATIVOTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = Data.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });


				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_COM_CUADRO_COMPARATIVO_AUTORIZAR",true,p);

				Data.CORR_CUADRO_COMPARATIVO = (int)objData.objCommand.Parameters["CORR_CUADRO_COMPARATIVO"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = Data.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_CUADRO_COMPARATIVO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["CORR_CUADRO_COMPARATIVO"].Value;
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
		public async Task<CResult> UpdateAutorizarAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="FECHA_CUADRO_COMPARATIVO",Value=Data.FECHA_CUADRO_COMPARATIVO,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTADO_CUADRO_COMPARATIVO",Value=Data.ESTADO_CUADRO_COMPARATIVO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_CUADRO_COMPARATIVO",Value=Data.USUARIO_CUADRO_COMPARATIVO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="OBSERVACIONES",Value=Data.OBSERVACIONES,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ES_MEJOR_PRECIO",Value=Data.ES_MEJOR_PRECIO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_CREDITO_30_DIAS",Value=Data.TIENE_CREDITO_30_DIAS,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_BUEN_SOPORTE_TECNICO",Value=Data.TIENE_BUEN_SOPORTE_TECNICO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_BUENA_CALIDAD_PRODUCTO",Value=Data.TIENE_BUENA_CALIDAD_PRODUCTO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="TIENE_MEJOR_TIEMPO_ENTREGA",Value=Data.TIENE_MEJOR_TIEMPO_ENTREGA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="BRINDA_BUENA_EXPERIENCIA_PROVEEDOR",Value=Data.BRINDA_BUENA_EXPERIENCIA_PROVEEDOR,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="ES_PROVEEDOR_UNICO",Value=Data.ES_PROVEEDOR_UNICO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="EXISTE_OTRA_RAZON",Value=Data.EXISTE_OTRA_RAZON,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="NOMBRE_OTRA_RAZON",Value=Data.NOMBRE_OTRA_RAZON,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
				};
				var vQry = @$"
								UPDATE COM_CUADRO_COMPARATIVO
								SET FECHA_CUADRO_COMPARATIVO=@FECHA_CUADRO_COMPARATIVO
								,ESTADO_CUADRO_COMPARATIVO=@ESTADO_CUADRO_COMPARATIVO
								,USUARIO_CUADRO_COMPARATIVO=@USUARIO_CUADRO_COMPARATIVO
								,OBSERVACIONES=@OBSERVACIONES
								,ES_MEJOR_PRECIO=@ES_MEJOR_PRECIO
								,TIENE_CREDITO_30_DIAS=@TIENE_CREDITO_30_DIAS
								,TIENE_BUEN_SOPORTE_TECNICO=@TIENE_BUEN_SOPORTE_TECNICO
								,TIENE_BUENA_CALIDAD_PRODUCTO=@TIENE_BUENA_CALIDAD_PRODUCTO
								,TIENE_MEJOR_TIEMPO_ENTREGA=@TIENE_MEJOR_TIEMPO_ENTREGA
								,BRINDA_BUENA_EXPERIENCIA_PROVEEDOR=@BRINDA_BUENA_EXPERIENCIA_PROVEEDOR
								,ES_PROVEEDOR_UNICO=@ES_PROVEEDOR_UNICO
								,EXISTE_OTRA_RAZON=@EXISTE_OTRA_RAZON
								,NOMBRE_OTRA_RAZON=@NOMBRE_OTRA_RAZON
								,USUARIO_ACTU=@USUARIO_ACTU
								,FECHA_ACTU=@FECHA_ACTU
								,ESTACION_ACTU=@ESTACION_ACTU
								WHERE CORR_EMPRESA=@CORR_EMPRESA
								AND ANIO_PERIODO=@ANIO_PERIODO
								AND CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO
							";
				var reader = await objData.ExecCmd(System.Data.CommandType.Text,vQry,true,p);

				vQry = @$"
							SELECT A.*
							,C.PERMITE_MODIFICAR
							FROM V_COM_CUADRO_COMPARATIVO A
							INNER JOIN COM_CUADRO_COMPARATIVO_AUTORIZACIONES C ON A.CORR_EMPRESA = C.CORR_EMPRESA AND C.LOGIN_SISTEMA=@USUARIO_ACTU AND A.ANIO_PERIODO = C.ANIO_PERIODO AND A.CORR_CUADRO_COMPARATIVO = A.CORR_CUADRO_COMPARATIVO
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA 
							AND A.ANIO_PERIODO=@ANIO_PERIODO
							AND A.CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO
						";

				var readerGet = await objData.GetDataReader(System.Data.CommandType.Text, vQry, p);
				var response = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(readerGet).FirstOrDefault();
				
				readerGet.Close();
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
		
		public async Task<CResult> GetComCuadroComparativoProeveedorCorreo(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var vQry = @$"	SELECT 
									A.CORR_EMPRESA
									,A.ANIO_PERIODO
									,A.CORR_CUADRO_COMPARATIVO
									,C.CORR_PROVEEDOR
									,dbo.StrConcat(DISTINCT ISNULL(C.USUARIO_COTIZA,''))USUARIO_COTIZA
									,dbo.StrConcat(DISTINCT ISNULL(D.NOMBRE_PROVEEDOR,''))NOMBRE_USUARIO
									,dbo.StrConcat(DISTINCT ISNULL(D.CORREO_ELECTRONICO_1,''))CORREO_ELECTRONICO
								FROM dbo.COM_CUADRO_COMPARATIVO_SOLI_COTIZACION A
								INNER JOIN dbo.COM_SOLI_COTIZACION B ON A.CORR_EMPRESA=B.CORR_EMPRESA AND A.ANIO_PERIODO_SOLI_COTI=B.ANIO_PERIODO AND A.CORR_SOLI_COTIZACION=B.CORR_SOLI_COTIZACION
								INNER JOIN dbo.COM_COTIZACION C ON C.CORR_EMPRESA = B.CORR_EMPRESA AND C.ANIO_PERIODO_SOLI_COTI = B.ANIO_PERIODO AND C.CORR_SOLI_COTIZACION = B.CORR_SOLI_COTIZACION
								INNER JOIN dbo.COM_PROVEEDOR D ON C.CORR_PROVEEDOR=D.CORR_PROVEEDOR
								WHERE A.CORR_EMPRESA=@CORR_EMPRESA
								AND A.ANIO_PERIODO=@ANIO_PERIODO
								AND A.CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO
								GROUP BY A.CORR_EMPRESA
								,A.ANIO_PERIODO
								,A.CORR_CUADRO_COMPARATIVO
								,C.CORR_PROVEEDOR
										";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_PROVEEDOR_CORREOView>().FromDataReader(reader).ToList();

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
		public async Task<CResult> GetComCuadroComparativoProeveedorCorreoUsuarioSoliCotizacion(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var vQry = @$"	SELECT 
								A.CORR_EMPRESA
								,A.ANIO_PERIODO
								,A.CORR_CUADRO_COMPARATIVO
								,C.CORR_PROVEEDOR
								,dbo.StrConcat(DISTINCT ISNULL(B.USUARIO_SOLI,''))USUARIO_SOLI
								,dbo.StrConcat(DISTINCT ISNULL(D.NOMBRE_USUARIO,ISNULL(E.NOMBRE_USUARIO,'')))NOMBRE_USUARIO
								,dbo.StrConcat(DISTINCT ISNULL(D.CORREO_ELECTRONICO,ISNULL(E.CORREO_ELECTRONICO,'')))CORREO_ELECTRONICO
								FROM COM_CUADRO_COMPARATIVO_SOLI_COTIZACION A
								INNER JOIN COM_SOLI_COTIZACION B ON A.CORR_EMPRESA=B.CORR_EMPRESA AND A.ANIO_PERIODO_SOLI_COTI=B.ANIO_PERIODO AND A.CORR_SOLI_COTIZACION=B.CORR_SOLI_COTIZACION
								INNER JOIN COM_COTIZACION C ON C.CORR_EMPRESA = B.CORR_EMPRESA AND C.ANIO_PERIODO_SOLI_COTI = B.ANIO_PERIODO AND C.CORR_SOLI_COTIZACION = B.CORR_SOLI_COTIZACION
								LEFT OUTER JOIN SEG_USUARIO D ON B.USUARIO_SOLI=D.LOGIN_SISTEMA
								LEFT OUTER JOIN V_SEG_USUARIO_CLASS E ON B.CORR_EMPRESA = E.CORR_EMPRESA AND B.USUARIO_SOLI COLLATE DATABASE_DEFAULT =E.LOGIN_SISTEMA COLLATE DATABASE_DEFAULT	
								WHERE A.CORR_EMPRESA=@CORR_EMPRESA
								AND A.ANIO_PERIODO=@ANIO_PERIODO
								AND A.CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO
								GROUP BY A.CORR_EMPRESA
								,A.ANIO_PERIODO
								,A.CORR_CUADRO_COMPARATIVO
								,C.CORR_PROVEEDOR
										";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_PROVEEDOR_CORREOView>().FromDataReader(reader).ToList();

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
		public async Task<bool> ValidarEnviarCorreo(COM_CUADRO_COMPARATIVOTable Data)
		{
			bool enviarCorreo =false;
	
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
			p.Add(new CParameter() { ParameterName = "@CORR_CUADRO_COMPARATIVO", Value = Data.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
			p.Add(new CParameter() { ParameterName = "@ENVIAR_CORREO", Value = false, DbType = System.Data.DbType.Boolean, Direction = System.Data.ParameterDirection.InputOutput });
			
			var vQry = @$"

							IF NOT EXISTS (SELECT 1 FROM COM_CUADRO_COMPARATIVO_AUTORIZACIONES A
									WHERE A.CORR_EMPRESA=@CORR_EMPRESA
									AND A.ANIO_PERIODO=@ANIO_PERIODO
									AND A.CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO
									AND A.ESTADO_AUTORIZACION='SO'
								)
							BEGIN
								SELECT @ENVIAR_CORREO=1
							END ELSE
							BEGIN
								SELECT @ENVIAR_CORREO=0	
							END
									";

			var reader = await  objData.ExecCmd(System.Data.CommandType.Text, vQry,false, p);
			
			enviarCorreo=(bool)objData.objCommand.Parameters["@ENVIAR_CORREO"].Value;
			objData.objConnection.Close();
			

			return enviarCorreo;
		}
		public async Task<CResult> RechazarAsync(COM_CUADRO_COMPARATIVOTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = Data.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });


				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_COM_CUADRO_COMPARATIVO_RECHAZAR",true,p);

				Data.CORR_CUADRO_COMPARATIVO = (int)objData.objCommand.Parameters["CORR_CUADRO_COMPARATIVO"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = Data.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_CUADRO_COMPARATIVOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_CUADRO_COMPARATIVO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["CORR_CUADRO_COMPARATIVO"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Rechazar";
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
	
		public async Task<CResult> GetCorreoAutorizadores(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var vQry = @$"DECLARE @ORDEN_REVISION INT

							SELECT @ORDEN_REVISION=MIN(A.ORDEN_REVISION)
							FROM V_COM_CUADRO_COMPARATIVO_AUTORIZACIONES A
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							AND A.ANIO_PERIODO=@ANIO_PERIODO
							AND A.CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO
							AND A.ESTADO_AUTORIZACION='SO'

							SELECT dbo.StrConcat(ISNULL(B.NOMBRE_USUARIO,C.NOMBRE_USUARIO)+',')NOMBRE_USUARIO
							,dbo.StrConcat(ISNULL(B.CORREO_ELECTRONICO,C.CORREO_ELECTRONICO)+',')CORREO_ELECTRONICO
							,MIN(A.ORDEN_REVISION) ORDEN_REVISION
							FROM COM_CUADRO_COMPARATIVO_AUTORIZACIONES A
							LEFT OUTER JOIN SEG_USUARIO B ON A.LOGIN_SISTEMA = B.LOGIN_SISTEMA
							LEFT OUTER JOIN V_SEG_USUARIO_CLASS C ON A.CORR_EMPRESA = C.CORR_EMPRESA AND A.LOGIN_SISTEMA COLLATE DATABASE_DEFAULT = C.LOGIN_SISTEMA COLLATE DATABASE_DEFAULT
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							AND A.ANIO_PERIODO=@ANIO_PERIODO
							AND A.CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO
							AND A.ORDEN_REVISION=@ORDEN_REVISION
							GROUP BY A.ORDEN_REVISION";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<SEG_USUARIOView>().FromDataReader(reader).FirstOrDefault();
				
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
		public async Task<CResult> GetCotizacionesNormales(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName+"_SOLI_COTIZACION", xWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_SOLI_COTIZAView>().FromDataReader(reader).ToList();
				
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
		public async Task<CResult> CreateBitacoraAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
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
							@CODIGO_OPCION VARCHAR(150)='COM_CUADRO_COMPARATIVO',@CLASE_BITACORA VARCHAR(3)='EL'

							------------------------------------------------------------------------
							-------------  BITACORA -------------- 
							SELECT @LLAVE_TRANSACCION='Año: '+CONVERT(VARCHAR,A.ANIO_PERIODO) COLLATE DATABASE_DEFAULT+' Correlativo No.: '+CONVERT(VARCHAR,A.CORR_CUADRO_COMPARATIVO) COLLATE DATABASE_DEFAULT,
									@REFERENCIA_TRANSACCION= ' Fecha: '+ CONVERT(VARCHAR,A.FECHA_CUADRO_COMPARATIVO) COLLATE DATABASE_DEFAULT
															+', Proveedor: '+ISNULL(A.NOMBRE_PROVEEDOR,'') COLLATE DATABASE_DEFAULT
															+', Observaciones: '+ISNULL(A.OBSERVACIONES,'') COLLATE DATABASE_DEFAULT
															+', Justificación Elminación: '+@JUSTIFICACION_ELIMINAR COLLATE DATABASE_DEFAULT,
									@USUARIO_CREA_TRANS=A.USUARIO_CREA, @ESTACION_CREA_TRANS=A.ESTACION_CREA, @FECHA_CREA_TRANS=A.FECHA_CREA,
									@USUARIO_ACTU_TRANS=A.USUARIO_ACTU, @ESTACION_ACTU_TRANS=A.ESTACION_ACTU, @FECHA_ACTU_TRANS=A.FECHA_ACTU
							FROM V_COM_CUADRO_COMPARATIVO A
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							AND A.ANIO_PERIODO=@ANIO_PERIODO
							AND A.CORR_CUADRO_COMPARATIVO=@CORR_CUADRO_COMPARATIVO

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
				objResultado.CodeHelper = Data.CORR_CUADRO_COMPARATIVO;
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
