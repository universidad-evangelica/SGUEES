using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public class GEN_DOCUMENTO_FISICORepository: BaseRepository<GEN_DOCUMENTO_FISICOTable>, IGEN_DOCUMENTO_FISICORepository
	{
		private const string _TableName = "GEN_DOCUMENTO_FISICO";
			
		public GEN_DOCUMENTO_FISICORepository(IConfiguration config) : 
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
				var response = new List<GEN_DOCUMENTO_FISICOView>().FromDataReader(reader).ToList();
				
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
				var response = new List<GEN_DOCUMENTO_FISICOView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(GEN_DOCUMENTO_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();

				p.Add(new CParameter() {ParameterName="TIPO_ACTUALIZA", Value = UpdateType.Add, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() {ParameterName="CORR_SUSCRIPCION",Value=Data.CORR_SUSCRIPCION,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_CONFI_PAIS",Value=Data.CORR_CONFI_PAIS,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CODIGO_SUITE",Value=Data.CODIGO_SUITE,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO",Value=Data.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput});
				p.Add(new CParameter() {ParameterName="NOMBRE_DOCUMENTO",Value=Data.NOMBRE_DOCUMENTO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="DESCRIPCION_DOCUMENTO",Value=Data.DESCRIPCION_DOCUMENTO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=Data.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="RUTA_DOCUMENTO",Value=Data.RUTA_DOCUMENTO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="NOMBRE_ARCHIVO",Value=Data.NOMBRE_ARCHIVO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO_DOC",Value=Data.CORR_DOCUMENTO_DOC,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() {ParameterName="FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() {ParameterName="ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() {ParameterName="USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() {ParameterName="FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() {ParameterName="ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_"+_TableName,true,p);
				Data.CORR_DOCUMENTO=(int)objData.objCommand.Parameters["CORR_DOCUMENTO"].Value;

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_SUSCRIPCION", Value = Data.CORR_SUSCRIPCION, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CONFI_PAIS", Value = Data.CORR_CONFI_PAIS, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					// xWhere.Add(new CParameter() { ParameterName = "CODIGO_SUITE", Value = Data.CODIGO_SUITE, DbType = System.Data.DbType.String });
					xWhere.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });
					
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<GEN_DOCUMENTO_FISICOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_DETA"].Value;
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
		
		public async Task<CResult> UpdateAsync(GEN_DOCUMENTO_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() {ParameterName="TIPO_ACTUALIZA", Value = UpdateType.Update, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() {ParameterName="CORR_SUSCRIPCION",Value=Data.CORR_SUSCRIPCION,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_CONFI_PAIS",Value=Data.CORR_CONFI_PAIS,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CODIGO_SUITE",Value=Data.CODIGO_SUITE,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO",Value=Data.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput});
				p.Add(new CParameter() {ParameterName="NOMBRE_DOCUMENTO",Value=Data.NOMBRE_DOCUMENTO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="DESCRIPCION_DOCUMENTO",Value=Data.DESCRIPCION_DOCUMENTO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=Data.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="RUTA_DOCUMENTO",Value=Data.RUTA_DOCUMENTO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="NOMBRE_ARCHIVO",Value=Data.NOMBRE_ARCHIVO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO_DOC",Value=Data.CORR_DOCUMENTO_DOC,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() {ParameterName="FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() {ParameterName="ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() {ParameterName="USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() {ParameterName="FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() {ParameterName="ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String });
				
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_"+_TableName,true,p);
				Data.CORR_DOCUMENTO=(int)objData.objCommand.Parameters["CORR_DOCUMENTO"].Value;
				
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_SUSCRIPCION", Value = Data.CORR_SUSCRIPCION, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CONFI_PAIS", Value = Data.CORR_CONFI_PAIS, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					// xWhere.Add(new CParameter() { ParameterName = "CODIGO_SUITE", Value = Data.CODIGO_SUITE, DbType = System.Data.DbType.String });
					xWhere.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });
					
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<GEN_DOCUMENTO_FISICOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
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
		
		public async Task<CResult> DeleteAsync(GEN_DOCUMENTO_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();

				p.Add(new CParameter() {ParameterName="TIPO_ACTUALIZA", Value = 3, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() {ParameterName="CORR_SUSCRIPCION",Value=Data.CORR_SUSCRIPCION,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_CONFI_PAIS",Value=Data.CORR_CONFI_PAIS,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CODIGO_SUITE",Value=Data.CODIGO_SUITE,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO",Value=Data.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput});
				p.Add(new CParameter() {ParameterName="NOMBRE_DOCUMENTO",Value=Data.NOMBRE_DOCUMENTO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="DESCRIPCION_DOCUMENTO",Value=Data.DESCRIPCION_DOCUMENTO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=Data.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="RUTA_DOCUMENTO",Value=Data.RUTA_DOCUMENTO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="NOMBRE_ARCHIVO",Value=Data.NOMBRE_ARCHIVO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO_DOC",Value=Data.CORR_DOCUMENTO_DOC,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() {ParameterName="FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() {ParameterName="ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() {ParameterName="USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() {ParameterName="FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() {ParameterName="ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_"+_TableName,true,p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_SUSCRIPCION", Value = Data.CORR_SUSCRIPCION, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CONFI_PAIS", Value = Data.CORR_CONFI_PAIS, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					// xWhere.Add(new CParameter() { ParameterName = "CODIGO_SUITE", Value = Data.CODIGO_SUITE, DbType = System.Data.DbType.String });
					
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<GEN_DOCUMENTO_FISICOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
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
	
		public async Task<CResult> CreateGenDocFisicoAsync(List<CParameter> P, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure,"PRAL_MTTO_"+_TableName,true,P);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					objResultado.Data = (int)objData.objCommand.Parameters["CORR_DOCUMENTO"].Value;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Generar()";
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
		
		public async Task<CResult> UpdateRutaAsync(GEN_DOCUMENTO_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new() {ParameterName="RUTA_DOCUMENTO",Value=Data.RUTA_DOCUMENTO,DbType=System.Data.DbType.String},
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_DOCUMENTO",Value=Data.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32},
				};

				var sql = @$"BEGIN
							SET NOCOUNT ON
							IF @@ERROR <> 0 SET NOEXEC ON
							UPDATE [e-AdminFE].dbo.GEN_DOCUMENTO_FISICO SET
							RUTA_DOCUMENTO=@RUTA_DOCUMENTO 
							WHERE CORR_EMPRESA=@CORR_EMPRESA 
							AND CORR_DOCUMENTO=@CORR_DOCUMENTO

							IF @@ERROR <> 0 SET NOEXEC ON
							SELECT *
							FROM V_GEN_DOCUMENTO_FISICO
							WHERE CORR_EMPRESA=@CORR_EMPRESA 
							AND CORR_DOCUMENTO=@CORR_DOCUMENTO
							SET NOEXEC OFF
							END";
				
				var reader = await objData.GetDataReader(System.Data.CommandType.Text,sql,pWhere);
				var response = new List<GEN_DOCUMENTO_FISICOView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_DOCUMENTO;
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
