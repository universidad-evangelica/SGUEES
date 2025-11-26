using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public class COM_SOLI_COTIZACION_PROVEEDORRepository: BaseRepository<COM_SOLI_COTIZACION_PROVEEDORTable>, ICOM_SOLI_COTIZACION_PROVEEDORRepository
	{
		private const string _TableName = "COM_SOLI_COTIZACION_PROVEEDOR";
		
		public COM_SOLI_COTIZACION_PROVEEDORRepository(IConfiguration config) : 
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
				var response = new List<COM_SOLI_COTIZACION_PROVEEDORView>().FromDataReader(reader).ToList();
				
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

		public async Task<CResult> GetCorreoProveedorCotizaAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_COM_COTIZACION_CORREO", xWhere);
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
		
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<COM_SOLI_COTIZACION_PROVEEDORView>().FromDataReader(reader).FirstOrDefault();
				
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

		public async Task<CResult> GetAllPROVEEDOR_DISPONIBLE(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var vQry = @$"SELECT A.SELECCION,
								@CORR_EMPRESA CORR_EMPRESA,
								@ANIO_PERIODO ANIO_PERIODO,
								@CORR_SOLI_COTIZACION CORR_SOLI_COTIZACION,
								A.CORR_PROVEEDOR,
								A.CODIGO_PROVEEDOR,
								A.NOMBRE_PROVEEDOR,
								A.CORR_CONDICION_PAGO,
								A.CORR_FORMA_PAGO,
								A.DETALLE_FORMA_PAGO
								FROM V_COM_PROVEEDOR_DISPONIBLE A 
								WHERE NOT EXISTS(SELECT 1 
											FROM COM_SOLI_COTIZACION_PROVEEDOR B 
											WHERE A.CORR_PROVEEDOR=B.CORR_PROVEEDOR 
											AND B.CORR_EMPRESA=@CORR_EMPRESA
											AND B.ANIO_PERIODO=@ANIO_PERIODO 
											AND B.CORR_SOLI_COTIZACION=@CORR_SOLI_COTIZACION)
										";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_SOLI_COTIZACION_PROVEEDORView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
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
		
		public async Task<CResult> CreateAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
		
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="CORR_CONDICION_PAGO",Value=Data.CORR_CONDICION_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_FORMA_PAGO",Value=Data.CORR_FORMA_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="DETALLE_FORMA_PAGO",Value=Data.DETALLE_FORMA_PAGO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA",Value=DateTime.Now,DbType=System.Data.DbType.DateTime},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Insert(_TableName,p,"",pWhere);
				var response = new List<COM_SOLI_COTIZACION_PROVEEDORView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_PROVEEDOR;
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
		
		public async Task<CResult> UpdateAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_CONDICION_PAGO",Value=Data.CORR_CONDICION_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_FORMA_PAGO",Value=Data.CORR_FORMA_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="DETALLE_FORMA_PAGO",Value=Data.DETALLE_FORMA_PAGO,DbType=System.Data.DbType.String},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<COM_SOLI_COTIZACION_PROVEEDORView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_PROVEEDOR;
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
		
		public async Task<CResult> DeleteAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_PROVEEDOR;
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

		public async Task<CResult> AnularAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "@CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_COM_SOLI_COTIZACION_PROVEEDOR_ANULAR",true,p);

				Data.CORR_PROVEEDOR = (int)objData.objCommand.Parameters["@CORR_PROVEEDOR"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_SOLI_COTIZACION_PROVEEDORView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_PROVEEDOR;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_PROVEEDOR"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(AnularProveedor)";
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

		public async Task<CResult> HabilitarAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32});
				p.Add(new CParameter() { ParameterName = "@CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 , Direction = System.Data.ParameterDirection.InputOutput });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_COM_SOLI_COTIZACION_PROVEEDOR_HABILITAR",true,p);

				Data.CORR_PROVEEDOR = (int)objData.objCommand.Parameters["@CORR_PROVEEDOR"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = Data.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_SOLI_COTIZACION_PROVEEDORView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_PROVEEDOR;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_PROVEEDOR"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(HabilitarProveedor)";
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

		public async Task<CResult> GenerarCotizacionAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="USUARIO_CREA",Value=vLOGIN_SISTEMA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_CREA",Value=vESTACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA",Value=DateTime.Now,DbType=System.Data.DbType.DateTime},
				};
				var sql = @$"DECLARE @CORR_COTIZACION INT,@CORR_COTIZACION_DETA INT=0
							,@SYS_LOGIN_USUARIO VARCHAR(50)

							SET @SYS_LOGIN_USUARIO=@USUARIO_CREA
							
							SELECT @CORR_COTIZACION=ISNULL(MAX(CORR_COTIZACION),0)+1
							FROM COM_COTIZACION
							WHERE CORR_EMPRESA=@CORR_EMPRESA
							AND ANIO_PERIODO=@ANIO_PERIODO

							INSERT INTO COM_COTIZACION
							(
								CORR_EMPRESA,
								ANIO_PERIODO,
								CORR_COTIZACION,
								FECHA_COTIZACION,
								CORR_PROVEEDOR,
								USUARIO_COTIZA,
								OBSERVACIONES,
								OBSERVACIONES_PROVEEDOR,
								PLAZO_ENTREGA,
								ESTADO_COTIZACION,
								ANIO_PERIODO_SOLI_COTI,
								CORR_SOLI_COTIZACION,
								USUARIO_CREA,
								FECHA_CREA,
								ESTACION_CREA,
								USUARIO_ACTU,
								FECHA_ACTU,
								ESTACION_ACTU
							)
							SELECT A.CORR_EMPRESA,
							A.ANIO_PERIODO,
							@CORR_COTIZACION,
							@FECHA_CREA,
							@CORR_PROVEEDOR,
							'',
							A.OBSERVACIONES,
							'',
							'',
							'SO',
							A.ANIO_PERIODO,
							A.CORR_SOLI_COTIZACION,
							@SYS_LOGIN_USUARIO,
							@FECHA_CREA,
							@SYS_LOGIN_USUARIO,
							@SYS_LOGIN_USUARIO,
							@FECHA_CREA,
							@SYS_LOGIN_USUARIO
							FROM COM_SOLI_COTIZACION A
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							AND A.ANIO_PERIODO=@ANIO_PERIODO
							AND A.CORR_SOLI_COTIZACION=@CORR_SOLI_COTIZACION

							INSERT INTO COM_COTIZACION_DETA
							(
								CORR_EMPRESA,
								ANIO_PERIODO,
								CORR_COTIZACION,
								CORR_COTIZACION_DETA,
								CODIGO_ITEM,
								CANTIDAD,
								CORR_UNIDAD_MEDIDA,
								PRECIO_UNITARIO,
								MONTO_SUBTOTAL,
								OBSERVACIONES,
								MARCA,
								ESTADO_SOLI_COTIZACION,
								USUARIO_CREA,
								FECHA_CREA,
								ESTACION_CREA,
								USUARIO_ACTU,
								FECHA_ACTU,
								ESTACION_ACTU
							)
							SELECT A.CORR_EMPRESA,
							A.ANIO_PERIODO,
							@CORR_COTIZACION,
							@CORR_COTIZACION_DETA +ROW_NUMBER() OVER(PARTITION BY @CORR_EMPRESA,@CORR_COTIZACION ORDER BY @CORR_EMPRESA,@CORR_COTIZACION),
							A.CODIGO_ITEM,
							A.CANTIDAD,
							A.CORR_UNIDAD_MEDIDA,
							0,
							0,
							A.OBSERVACIONES,
							'',
							'SO',
							@SYS_LOGIN_USUARIO,
							@FECHA_CREA,
							@SYS_LOGIN_USUARIO,
							@SYS_LOGIN_USUARIO,
							@FECHA_CREA,
							@SYS_LOGIN_USUARIO
							FROM COM_SOLI_COTIZACION_DETA A
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							AND A.ANIO_PERIODO=@ANIO_PERIODO
							AND A.CORR_SOLI_COTIZACION=@CORR_SOLI_COTIZACION
							";
				var vResultado = await objData.ExecCmd(System.Data.CommandType.Text, sql, true, pWhere);

				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = Data.CORR_PROVEEDOR;
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
		
		public async Task<CResult> ExisteProveedor(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var vQry = @$"SELECT A.CORR_EMPRESA
							,A.ANIO_PERIODO
							,A.CORR_SOLI_COTIZACION
							,A.CORR_PROVEEDOR
							,A.CORR_CONDICION_PAGO
							,A.CORR_FORMA_PAGO
							,A.DETALLE_FORMA_PAGO
							,A.USUARIO_CREA
							,A.ESTACION_CREA
							,A.FECHA_CREA FROM COM_SOLI_COTIZACION_PROVEEDOR A
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							AND A.ANIO_PERIODO=@ANIO_PERIODO
							AND A.CORR_SOLI_COTIZACION=@CORR_SOLI_COTIZACION
							AND A.CORR_PROVEEDOR=@CORR_PROVEEDOR";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_SOLI_COTIZACION_PROVEEDORView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				if (response.Count > 0)
				{
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "Este proveedor ya fue seleccionado";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
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
