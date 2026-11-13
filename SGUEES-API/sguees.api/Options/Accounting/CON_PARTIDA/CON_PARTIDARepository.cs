using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_PARTIDARepository: BaseRepository<CON_PARTIDATable>, ICON_PARTIDARepository
	{
		private const string _TableName = "CON_PARTIDA";
		
		public CON_PARTIDARepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var corrPartida = System.Convert.ToInt32(
					xWhere.FirstOrDefault(p => p.ParameterName == "CORR_PARTIDA")?.Value ?? 0);
				var fechaInicial = xWhere.FirstOrDefault(p => p.ParameterName == "FECHA_INICIAL")?.Value;
				var fechaFinal = xWhere.FirstOrDefault(p => p.ParameterName == "FECHA_FINAL")?.Value;
				
				var reader = corrPartida == 0 && fechaInicial != null && fechaFinal != null
					? await objData.GetDataReader(System.Data.CommandType.Text, @"
						SELECT A.*
						FROM V_CON_PARTIDA A
						WHERE A.CORR_EMPRESA=@CORR_EMPRESA
						AND A.FECHA_PARTIDA>=@FECHA_INICIAL
						AND A.FECHA_PARTIDA<=@FECHA_FINAL
						ORDER BY A.FECHA_PARTIDA DESC, A.CORR_PARTIDA DESC", xWhere)
					: await objData.GetDataReader("V_"+_TableName, xWhere);
				
				var response = new List<CON_PARTIDAView>().FromDataReader(reader).ToList();
				
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
				var response = new List<CON_PARTIDAView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await Save(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Add);
		}
		
		public async Task<CResult> UpdateAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await Save(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);
		}
		
		public async Task<CResult> DeleteAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = UpdateType.Delete, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@FECHA_PARTIDA", Value = Data.FECHA_PARTIDA == default ? System.DateTime.Today : Data.FECHA_PARTIDA, DbType = System.Data.DbType.Date });
				p.Add(new CParameter() { ParameterName = "@NUMERO_DOCUMENTO", Value = Data.NUMERO_DOCUMENTO ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@NOMBRE_PARTIDA", Value = Data.NOMBRE_PARTIDA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@ESTADO_PARTIDA", Value = Data.ESTADO_PARTIDA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CLASE_PARTIDA", Value = Data.CLASE_PARTIDA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CORR_MONEDA", Value = Data.CORR_MONEDA ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@FACTOR_CAMBIO", Value = Data.FACTOR_CAMBIO ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@OPERADOR", Value = Data.OPERADOR ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_CREA", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_CREA", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_CREA", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU ?? System.DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = Data.ESTACION_ACTU ?? "", DbType = System.Data.DbType.String });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
				
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);
				
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value);
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Delete.ToString() + ")";
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
		
		public async Task<CResult> Save(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType Tipo)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = Tipo, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@FECHA_PARTIDA", Value = Data.FECHA_PARTIDA == default ? System.DateTime.Today : Data.FECHA_PARTIDA, DbType = System.Data.DbType.Date });
				p.Add(new CParameter() { ParameterName = "@NUMERO_DOCUMENTO", Value = Data.NUMERO_DOCUMENTO ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@NOMBRE_PARTIDA", Value = Data.NOMBRE_PARTIDA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@ESTADO_PARTIDA", Value = Data.ESTADO_PARTIDA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CLASE_PARTIDA", Value = Data.CLASE_PARTIDA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CORR_MONEDA", Value = Data.CORR_MONEDA ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@FACTOR_CAMBIO", Value = Data.FACTOR_CAMBIO ?? (object)System.DBNull.Value, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@OPERADOR", Value = Data.OPERADOR ?? (object)System.DBNull.Value, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_CREA", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_CREA", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_CREA", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU ?? vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU ?? System.DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = Data.ESTACION_ACTU ?? vESTACION ?? "", DbType = System.Data.DbType.String });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
				
				var vResultado = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);
				
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					Data.CORR_PARTIDA = (int)objData.objCommand.Parameters["@CORR_PARTIDA"].Value;
					
					p.Clear();
					p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 });
					
					var readerGet = await objData.GetDataReader("V_" + _TableName, p);
					var response = new List<CON_PARTIDAView>().FromDataReader(readerGet).FirstOrDefault();
					
					readerGet.Close();
					readerGet = null;
					
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + Tipo.ToString() + ")";
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
		
		public async Task<CResult> GetAllAplicarAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var vQry = @"
					SELECT A.*, CONVERT(BIT,0) AS SELECCION
					FROM V_CON_PARTIDA_APLICAR A
					WHERE A.CORR_EMPRESA=@CORR_EMPRESA
					AND A.FECHA_PARTIDA>=@FECHA_INICIAL
					AND A.FECHA_PARTIDA<=@FECHA_FINAL
					AND A.ESTADO_PARTIDA = CASE WHEN @OPCION_CONSULTA=1 THEN 'DI' ELSE 'AP' END
					AND (@OPCION_CONSULTA<>1 OR (A.MONTO_CARGO=A.MONTO_ABONO AND A.MONTO_CARGO>0))
					ORDER BY A.FECHA_PARTIDA DESC, A.CORR_PARTIDA DESC";
				
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<CON_PARTIDA_APLICARView>().FromDataReader(reader).ToList();
				
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
		
		public async Task<CResult> AplicarAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
				
				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CON_PARTIDA_APLICAR", true, p);
				
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 });
					
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<CON_PARTIDAView>().FromDataReader(readerGet).FirstOrDefault();
					
					readerGet.Close();
					reader = null;
					
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
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
		
		public async Task<CResult> DesAplicarAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
				
				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CON_PARTIDA_DESAPLICAR", true, p);
				
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 });
					
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<CON_PARTIDAView>().FromDataReader(readerGet).FirstOrDefault();
					
					readerGet.Close();
					reader = null;
					
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
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
		
		public async Task<CResult> AnularAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
				
				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CON_PARTIDA_ANULAR", true, p);
				
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 });
					
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<CON_PARTIDAView>().FromDataReader(readerGet).FirstOrDefault();
					
					readerGet.Close();
					reader = null;
					
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
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
		
		public async Task<CResult> CrearPartidaModeloAsync(CON_PARTIDAParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@FECHA_PARTIDA", Value = Data.FECHA_PARTIDA, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@USUARIO_CREA", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_CREA", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_CREA", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
				
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_GENE_CON_PARTIDA_MODELO", true, p);
				
				if ((decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var corrPartida = (int)objData.objCommand.Parameters["@CORR_PARTIDA"].Value;
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_PARTIDA", Value = corrPartida, DbType = System.Data.DbType.Int32 });
					
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<CON_PARTIDAView>().FromDataReader(readerGet).FirstOrDefault();
					
					readerGet.Close();
					readerGet = null;
					
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = corrPartida;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Gene(PRAL_GENE_CON_PARTIDA_MODELO)";
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
		
		public async Task<CResult> CrearModeloAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@USUARIO_CREA", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_CREA", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_CREA", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
				
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_GENE_CON_PARTIDA_MODELO_CREA", true, p);
				
				if ((decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var corrPartidaModelo = (int)objData.objCommand.Parameters["@CORR_PARTIDA"].Value;
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_PARTIDA", Value = corrPartidaModelo, DbType = System.Data.DbType.Int32 });
					
					var readerGet = await objData.GetDataReader("V_CON_PARTIDA_MODELO", xWhere);
					var response = new List<CON_PARTIDA_MODELOView>().FromDataReader(readerGet).FirstOrDefault();
					
					readerGet.Close();
					readerGet = null;
					
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = corrPartidaModelo;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Gene(PRAL_GENE_CON_PARTIDA_MODELO_CREA)";
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
		
		public async Task<CResult> ImportarExcelAsync(CON_PARTIDA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				if (Data.Rows == null || Data.Rows.Count == 0)
				{
					objResultado.Data = 0;
					objResultado.Result = true;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
					return objResultado;
				}
				
				var groups = Data.Rows
					.GroupBy(r => new { Fecha = r.FECHA_PARTIDA.Date, r.NUMERO_DOCUMENTO })
					.ToList();
				
				int partidasCreadas = 0;
				
				foreach (var group in groups)
				{
					var first = group.First();
					var anioPeriodo = first.FECHA_PARTIDA.Year;
					var mesPeriodo = first.FECHA_PARTIDA.Month;
					
					var p = new List<CParameter>();
					p.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = UpdateType.Add, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = anioPeriodo, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = mesPeriodo, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
					p.Add(new CParameter() { ParameterName = "@FECHA_PARTIDA", Value = first.FECHA_PARTIDA, DbType = System.Data.DbType.Date });
					p.Add(new CParameter() { ParameterName = "@NUMERO_DOCUMENTO", Value = first.NUMERO_DOCUMENTO, DbType = System.Data.DbType.String });
					p.Add(new CParameter() { ParameterName = "@NOMBRE_PARTIDA", Value = first.NOMBRE_TRAN ?? "", DbType = System.Data.DbType.String });
					p.Add(new CParameter() { ParameterName = "@ESTADO_PARTIDA", Value = "DI", DbType = System.Data.DbType.String });
					p.Add(new CParameter() { ParameterName = "@CLASE_PARTIDA", Value = "NOR", DbType = System.Data.DbType.String });
					p.Add(new CParameter() { ParameterName = "@CORR_MONEDA", Value = System.DBNull.Value, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "@FACTOR_CAMBIO", Value = System.DBNull.Value, DbType = System.Data.DbType.Decimal });
					p.Add(new CParameter() { ParameterName = "@OPERADOR", Value = System.DBNull.Value, DbType = System.Data.DbType.String });
					p.Add(new CParameter() { ParameterName = "@USUARIO_CREA", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
					p.Add(new CParameter() { ParameterName = "@FECHA_CREA", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime });
					p.Add(new CParameter() { ParameterName = "@ESTACION_CREA", Value = vESTACION, DbType = System.Data.DbType.String });
					p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
					p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime });
					p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String });
					
					//Parametros para gestionar la operación
					p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
					p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
					p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
					p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput });
					p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
					
					await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);
					
					if ((decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value != 0)
					{
						objResultado.Data = null;
						objResultado.Result = false;
						objResultado.RowsAffected = 0;
						objResultado.CodeHelper = 0;
						objResultado.ErrorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
						objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
						objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Add.ToString() + ")";
						return objResultado;
					}
					
					var corrPartida = (int)objData.objCommand.Parameters["@CORR_PARTIDA"].Value;
					
					foreach (var row in group)
					{
						var pDeta = new List<CParameter>();
						pDeta.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = UpdateType.Add, DbType = System.Data.DbType.Int32 });
						pDeta.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
						pDeta.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = anioPeriodo, DbType = System.Data.DbType.Int32 });
						pDeta.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = mesPeriodo, DbType = System.Data.DbType.Int32 });
						pDeta.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
						pDeta.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = corrPartida, DbType = System.Data.DbType.Int32 });
						pDeta.Add(new CParameter() { ParameterName = "@CORR_PARTIDA_DETA", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
						pDeta.Add(new CParameter() { ParameterName = "@CUENTA_CONTABLE", Value = row.CUENTA_CONTABLE, DbType = System.Data.DbType.String });
						pDeta.Add(new CParameter() { ParameterName = "@CORR_CENTRO_COSTO", Value = row.CORR_CENTRO_COSTO, DbType = System.Data.DbType.Int32 });
						pDeta.Add(new CParameter() { ParameterName = "@MONTO_CARGO", Value = row.MONTO_CARGO, DbType = System.Data.DbType.Decimal });
						pDeta.Add(new CParameter() { ParameterName = "@MONTO_ABONO", Value = row.MONTO_ABONO, DbType = System.Data.DbType.Decimal });
						pDeta.Add(new CParameter() { ParameterName = "@NOMBRE_TRAN", Value = row.NOMBRE_TRAN, DbType = System.Data.DbType.String });
						pDeta.Add(new CParameter() { ParameterName = "@MONTO_CARGO_FORANEA", Value = System.DBNull.Value, DbType = System.Data.DbType.Decimal });
						pDeta.Add(new CParameter() { ParameterName = "@MONTO_ABONO_FORANEA", Value = System.DBNull.Value, DbType = System.Data.DbType.Decimal });
						pDeta.Add(new CParameter() { ParameterName = "@FACTOR_CAMBIO", Value = System.DBNull.Value, DbType = System.Data.DbType.Decimal });
						
						//Parametros para gestionar la operación
						pDeta.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
						pDeta.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
						pDeta.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
						pDeta.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput });
						pDeta.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
						pDeta.Add(new CParameter() { ParameterName = "@CORR_AUXILIAR", Value = System.DBNull.Value, DbType = System.Data.DbType.Int32 });
						
						await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CON_PARTIDA_DETA", true, pDeta);
						
						if ((decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value != 0)
						{
							objResultado.Data = null;
							objResultado.Result = false;
							objResultado.RowsAffected = 0;
							objResultado.CodeHelper = corrPartida;
							objResultado.ErrorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
							objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
							objResultado.ErrorSource = "C" + _TableName + ".ImportarExcel(PRAL_MTTO_CON_PARTIDA_DETA)";
							return objResultado;
						}
					}
					
					partidasCreadas++;
				}
				
				objResultado.Data = partidasCreadas;
				objResultado.Result = true;
				objResultado.RowsAffected = partidasCreadas;
				objResultado.CodeHelper = partidasCreadas;
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
		
		public async Task<CResult> GetAllDetaDocAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_CON_PARTIDA_DETA_DOC", xWhere);
				var response = new List<CON_PARTIDA_DETA_DOCView>().FromDataReader(reader).ToList();
				
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
		
		public async Task<CResult> GetConPartidaImpr(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_IMPR_CON_PARTIDA_CONTABLE", xWhere);
				var response = new List<CON_PARTIDA_IMPRView>().FromDataReader(reader).ToList();
				if (reader.NextResult())
				{
					var header = new List<CON_PARTIDA_IMPRView>().FromDataReader(reader).FirstOrDefault();
					if (header != null)
					{
						foreach (var row in response)
						{
							row.NOMBRE_EMPRESA = header.NOMBRE_EMPRESA;
							row.PERIODO = header.PERIODO;
							row.LOGO1 = header.LOGO1;
							row.LOGO2 = header.LOGO2;
							row.TITULO_REPORTE = header.TITULO_REPORTE;
							row.NOMBRE_SISTEMA = header.NOMBRE_SISTEMA;
							row.FECHA_IMPRESION = header.FECHA_IMPRESION;
						}
					}
				}
				
				EnrichPartidaPrintRows(response);
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = response.Count > 0;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = response.Count > 0 ? 0 : -1;
				objResultado.ErrorMessage = response.Count > 0 ? "" : "No hay datos para imprimir la partida.";
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
		
		public async Task<CResult> ConsultarParaImprAsync(CON_PARTIDAParam param)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = param.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "@FECHA_INICIAL", Value = param.FECHA_INICIAL, DbType = System.Data.DbType.Date });
			p.Add(new CParameter() { ParameterName = "@FECHA_FINAL", Value = param.FECHA_FINAL, DbType = System.Data.DbType.Date });
			p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = param.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = param.MES_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = param.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA", Value = param.CORR_PARTIDA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA_INICIAL", Value = 0, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA_FINAL", Value = 0, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "@FOLIADO", Value = false, DbType = System.Data.DbType.Boolean });
			p.Add(new CParameter() { ParameterName = "@NUMERO_FOLIO", Value = 0, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "@CORR_MONEDA", Value = 0, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "@OPCION_CONSULTA", Value = 0, DbType = System.Data.DbType.Int32 });
			
			return await GetConPartidaImpr(p);
		}
		
		public async Task<CResult> GenerarPartidaLiquidacionAsync(CON_PARTIDAParam param, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await GenerarPartidaEspecialAsync(param, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_PARTIDA_LIQUIDACION");
		}
		
		public async Task<CResult> GenerarPartidaCierreAsync(CON_PARTIDAParam param, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await GenerarPartidaEspecialAsync(param, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_PARTIDA_CIERRE");
		}
		
		public async Task<CResult> GenerarPartidaAperturaAsync(CON_PARTIDAParam param, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await GenerarPartidaEspecialAsync(param, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_PARTIDA_APERTURA");
		}
		
		private async Task<CResult> GenerarPartidaEspecialAsync(CON_PARTIDAParam Data, string vLOGIN_SISTEMA, string vESTACION, string spName)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });
				
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);
				
				if ((decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value);
					objResultado.CodeHelper = Data.MES_PERIODO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Gene(" + spName + ")";
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

		public async Task<CResult> GetAllContrapartidaElegibleAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var vQry = @"
					SELECT A.CORR_EMPRESA, A.ANIO_PERIODO, A.MES_PERIODO, A.CORR_CLASE_PARTIDA, B.NOMBRE_CORTO_CLASE, B.NOMBRE_CLASE_PARTIDA,
					       A.CORR_PARTIDA, A.NUMERO_DOCUMENTO, A.FECHA_PARTIDA, A.NOMBRE_PARTIDA, A.ESTADO_PARTIDA, A.NOMBRE_ESTADO_PARTIDA,
					       A.MONTO_CARGO, A.MONTO_ABONO, CONVERT(BIT, 0) AS SELECCION
					FROM V_CON_PARTIDA A
					INNER JOIN CON_CLASE_PARTIDA B ON A.CORR_EMPRESA = B.CORR_EMPRESA AND A.CORR_CLASE_PARTIDA = B.CORR_CLASE_PARTIDA
					INNER JOIN CON_PERIODO_CONTABLE P ON A.CORR_EMPRESA = P.CORR_EMPRESA
						AND A.ANIO_PERIODO = P.ANIO_PERIODO AND A.MES_PERIODO = P.MES_PERIODO
					WHERE A.CORR_EMPRESA = @CORR_EMPRESA
					  AND ISNULL(P.ESTADO_PERIODO_CON,'AB') = 'CE'
					  AND A.ESTADO_PARTIDA = 'AP'
					  AND ISNULL(A.CLASE_PARTIDA,'NOR') = 'NOR'
					  AND A.FECHA_PARTIDA >= @FECHA_INICIAL
					  AND A.FECHA_PARTIDA <= @FECHA_FINAL
					  AND (@FILTRO_ANIO_PERIODO = 0 OR A.ANIO_PERIODO = @FILTRO_ANIO_PERIODO)
					  AND (@FILTRO_MES_PERIODO = 0 OR A.MES_PERIODO = @FILTRO_MES_PERIODO)
					  AND NOT EXISTS (
						SELECT 1 FROM CON_PARTIDA_CONTRAPARTIDA CP
						WHERE CP.CORR_EMPRESA = A.CORR_EMPRESA
						  AND CP.ANIO_PERIODO_ORIGEN = A.ANIO_PERIODO
						  AND CP.MES_PERIODO_ORIGEN = A.MES_PERIODO
						  AND CP.CORR_CLASE_PARTIDA_ORIGEN = A.CORR_CLASE_PARTIDA
						  AND CP.CORR_PARTIDA_ORIGEN = A.CORR_PARTIDA
					  )
					ORDER BY A.ANIO_PERIODO DESC, A.MES_PERIODO DESC, A.FECHA_PARTIDA DESC, A.CORR_PARTIDA DESC";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<CON_PARTIDA_APLICARView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
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

		public async Task<CResult> GetPeriodosDestinoContrapartidaAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_CON_PERIODO_CONTABLE", xWhere);
				var response = new List<CON_PERIODO_CONTABLEView>()
					.FromDataReader(reader)
					.Where(p => string.IsNullOrEmpty(p.ESTADO_PERIODO_CON) || p.ESTADO_PERIODO_CON == "AB")
					.OrderByDescending(p => p.ANIO_PERIODO)
					.ThenByDescending(p => p.MES_PERIODO)
					.ToList();
				reader.Close();
				reader = null;
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
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

		public async Task<CResult> GenerarContrapartidaAsync(CON_PARTIDAParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO_ORIGEN", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO_ORIGEN", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA_ORIGEN", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA_ORIGEN", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO_NUEVO", Value = Data.ANIO_PERIODO_DESTINO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO_NUEVO", Value = Data.MES_PERIODO_DESTINO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA_NUEVO", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PARTIDA_NUEVO", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@CORR_CONTRAPARTIDA", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_GENE_CON_PARTIDA_CONTRAPARTIDA", true, p);

				// Capturar outputs antes de GetDataReader: ese método reusa objCommand y borra los parámetros del SP.
				var numeroError = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value ?? 0);
				var mensajeError = Convert.ToString(objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value) ?? "";
				var filasAfectadas = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value ?? 0);
				var corrPartidaNuevo = System.Convert.ToInt32(objData.objCommand.Parameters["@CORR_PARTIDA_NUEVO"].Value ?? 0);

				if (numeroError == 0)
				{
					var xWhereGet = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO_DESTINO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO_DESTINO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PARTIDA", Value = corrPartidaNuevo, DbType = System.Data.DbType.Int32 },
					};

					var readerGet = await objData.GetDataReader("V_CON_PARTIDA", xWhereGet);
					var response = new List<CON_PARTIDAView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();
					readerGet = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = filasAfectadas;
					objResultado.CodeHelper = corrPartidaNuevo;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = numeroError;
					objResultado.ErrorMessage = mensajeError;
					objResultado.ErrorSource = "C" + _TableName + ".Gene(PRAL_GENE_CON_PARTIDA_CONTRAPARTIDA)";
				}
			}
			catch (System.Exception e)
			{
				objResultado.Result = false;
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
		
		private static void EnrichPartidaPrintRows(List<CON_PARTIDA_IMPRView> rows)
		{
			if (rows == null || rows.Count == 0)
			{
				return;
			}
			
			var first = rows[0];
			var periodo = first.ANIO_PERIODO > 0 && first.MES_PERIODO > 0
				? $"{first.MES_PERIODO:D2}/{first.ANIO_PERIODO}"
				: string.Empty;
			var fechaImpresion = first.FECHA_IMPRESION == default
				? System.DateTime.Now
				: first.FECHA_IMPRESION;
			
			foreach (var row in rows)
			{
				if (string.IsNullOrWhiteSpace(row.PERIODO))
				{
					row.PERIODO = periodo;
				}
				
				if (string.IsNullOrWhiteSpace(row.TITULO_REPORTE))
				{
					row.TITULO_REPORTE = "Partida Contable";
				}
				
				if (string.IsNullOrWhiteSpace(row.NOMBRE_SISTEMA))
				{
					row.NOMBRE_SISTEMA = "SGUEES";
				}
				
				if (row.FECHA_IMPRESION == default)
				{
					row.FECHA_IMPRESION = fechaImpresion;
				}
			}
		}
	}
}
