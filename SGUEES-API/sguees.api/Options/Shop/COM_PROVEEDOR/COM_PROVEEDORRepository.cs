using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public class COM_PROVEEDORRepository: BaseRepository<COM_PROVEEDORTable>, ICOM_PROVEEDORRepository
	{
		private const string _TableName = "COM_PROVEEDOR";
		
		public COM_PROVEEDORRepository(IConfiguration config) : 
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
				var response = new List<COM_PROVEEDORView>().FromDataReader(reader).ToList();
				
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
				var response = new List<COM_PROVEEDORView>().FromDataReader(reader).FirstOrDefault();
				
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

		public async Task<CResult> GetProveedorActuAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var sql = $@"SELECT *
										FROM V_COM_PROVEEDOR A
										WHERE EXISTS(SELECT 1 FROM COM_PROVEEDOR_USUARIO B
														WHERE A.CORR_PROVEEDOR=B.CORR_PROVEEDOR
														AND B.LOGIN_SISTEMA=@LOGIN_SISTEMA
														)";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text,sql,xWhere);
				var response = new List<COM_PROVEEDORView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(COM_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="@TIPO_ACTUALIZA",Value=UpdateType.Add,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="@CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="@CODIGO_PROVEEDOR",Value=Data.CODIGO_PROVEEDOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@TIPO_PERSONERIA",Value=Data.TIPO_PERSONERIA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@NOMBRE_PROVEEDOR",Value=Data.NOMBRE_PROVEEDOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@PRIMER_NOMBRE",Value=Data.PRIMER_NOMBRE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@SEGUNDO_NOMBRE",Value=Data.SEGUNDO_NOMBRE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@PRIMER_APELLIDO",Value=Data.PRIMER_APELLIDO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@SEGUNDO_APELLIDO",Value=Data.SEGUNDO_APELLIDO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@NOMBRE_COMERCIAL",Value=Data.NOMBRE_COMERCIAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORR_TIPO_DIP",Value=Data.CORR_TIPO_DIP,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="@NUMERO_DIP",Value=Data.NUMERO_DIP,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@NUMERO_NRC",Value=Data.NUMERO_NRC,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@NUMERO_NIT",Value=Data.NUMERO_NIT,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORR_ACTIVIDAD_ECONOMICA",Value=Data.CORR_ACTIVIDAD_ECONOMICA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@DIRECCION_PROVEEDOR",Value=Data.DIRECCION_PROVEEDOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CODIGO_PAIS",Value=Data.CODIGO_PAIS,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CODIGO_DEPTO",Value=Data.CODIGO_DEPTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CODIGO_MUNICIPIO",Value=Data.CODIGO_MUNICIPIO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@NOMBRE_CONTACTO",Value=Data.NOMBRE_CONTACTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@TELEFONO_FIJO",Value=Data.TELEFONO_FIJO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@TELEFONO_MOVIL",Value=Data.TELEFONO_MOVIL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORREO_ELECTRONICO_1",Value=Data.CORREO_ELECTRONICO_1,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORREO_ELECTRONICO_2",Value=Data.CORREO_ELECTRONICO_2,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORR_FORMA_PAGO",Value=Data.CORR_FORMA_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="@CUENTA_BANCARIA",Value=Data.CUENTA_BANCARIA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORR_BANCO",Value=Data.CORR_BANCO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="@ESTADO_PROVEEDOR",Value=Data.ESTADO_PROVEEDOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@ESTADO_PROVEEDOR_WEB",Value=Data.ESTADO_PROVEEDOR_WEB,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORR_CONDICION_PAGO",Value=Data.CORR_CONDICION_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="@USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="@ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="@ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@SYS_LOGIN_USUARIO",Value=vLOGIN_SISTEMA,DbType=System.Data.DbType.String },
					new CParameter() {ParameterName="@SYS_FILAS_AFECTADAS",Value=0,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="@SYS_ESTACION",Value=vESTACION,DbType=System.Data.DbType.String },
					new CParameter() {ParameterName="@SYS_NUMERO_ERROR",Value=0,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput },
					new CParameter() {ParameterName="@SYS_MENSAJE_ERROR",Value="",DbType=System.Data.DbType.String,Direction=System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};
				
				var vRowsAffected = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_"+_TableName,true,p);

				Data.CORR_PROVEEDOR = (int)objData.objCommand.Parameters["@CORR_PROVEEDOR"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_PROVEEDORView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					readerGet = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = (int)vRowsAffected;
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
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
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
		
		public async Task<CResult> UpdateAsync(COM_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="@TIPO_ACTUALIZA",Value=UpdateType.Update,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="@CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="@CODIGO_PROVEEDOR",Value=Data.CODIGO_PROVEEDOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@TIPO_PERSONERIA",Value=Data.TIPO_PERSONERIA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@NOMBRE_PROVEEDOR",Value=Data.NOMBRE_PROVEEDOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@PRIMER_NOMBRE",Value=Data.PRIMER_NOMBRE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@SEGUNDO_NOMBRE",Value=Data.SEGUNDO_NOMBRE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@PRIMER_APELLIDO",Value=Data.PRIMER_APELLIDO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@SEGUNDO_APELLIDO",Value=Data.SEGUNDO_APELLIDO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@NOMBRE_COMERCIAL",Value=Data.NOMBRE_COMERCIAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORR_TIPO_DIP",Value=Data.CORR_TIPO_DIP,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="@NUMERO_DIP",Value=Data.NUMERO_DIP,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@NUMERO_NRC",Value=Data.NUMERO_NRC,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@NUMERO_NIT",Value=Data.NUMERO_NIT,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORR_ACTIVIDAD_ECONOMICA",Value=Data.CORR_ACTIVIDAD_ECONOMICA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@DIRECCION_PROVEEDOR",Value=Data.DIRECCION_PROVEEDOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CODIGO_PAIS",Value=Data.CODIGO_PAIS,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CODIGO_DEPTO",Value=Data.CODIGO_DEPTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CODIGO_MUNICIPIO",Value=Data.CODIGO_MUNICIPIO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@NOMBRE_CONTACTO",Value=Data.NOMBRE_CONTACTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@TELEFONO_FIJO",Value=Data.TELEFONO_FIJO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@TELEFONO_MOVIL",Value=Data.TELEFONO_MOVIL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORREO_ELECTRONICO_1",Value=Data.CORREO_ELECTRONICO_1,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORREO_ELECTRONICO_2",Value=Data.CORREO_ELECTRONICO_2,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORR_FORMA_PAGO",Value=Data.CORR_FORMA_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="@CUENTA_BANCARIA",Value=Data.CUENTA_BANCARIA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORR_BANCO",Value=Data.CORR_BANCO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="@ESTADO_PROVEEDOR",Value=Data.ESTADO_PROVEEDOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@ESTADO_PROVEEDOR_WEB",Value=Data.ESTADO_PROVEEDOR_WEB,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@CORR_CONDICION_PAGO",Value=Data.CORR_CONDICION_PAGO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="@USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="@ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="@ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@SYS_LOGIN_USUARIO",Value=vLOGIN_SISTEMA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@SYS_ESTACION",Value=vESTACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="@SYS_FILAS_AFECTADAS",Value=0,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="@SYS_NUMERO_ERROR",Value=0,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="@SYS_MENSAJE_ERROR",Value="",DbType=System.Data.DbType.String,Direction=System.Data.ParameterDirection.InputOutput,Size = 4000},
				};

				
				var vRowsAffected = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_"+_TableName,true,p);

				Data.CORR_PROVEEDOR = (int)objData.objCommand.Parameters["@CORR_PROVEEDOR"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_PROVEEDORView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					readerGet = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = (int)vRowsAffected;
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
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
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
		
		public async Task<CResult> DeleteAsync(COM_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
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
	
		public async Task<CResult> GetCorreoUsuarioOpcionComProveedorAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var sql = $@"SELECT STRING_AGG(A.CORREO_ELECTRONICO,',') FROM SEG_USUARIO A
							INNER JOIN SEG_USUARIO_OPCION B ON A.LOGIN_SISTEMA = B.LOGIN_SISTEMA
							WHERE B.CODIGO_OPCION='COM_PROVEEDOR'";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text,sql,xWhere);
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
		public async Task<CResult> GetAllLookUpAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<COM_PROVEEDORView>().FromDataReader(reader).ToList();
				
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
		public async Task<CResult> GetAllLookUpProvComAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var reader = await objData.GetDataReader("V_COM_PROVEEDOR_COMPRAS", xWhere);
				var response = new List<COM_PROVEEDORView>().FromDataReader(reader).ToList();
				
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
