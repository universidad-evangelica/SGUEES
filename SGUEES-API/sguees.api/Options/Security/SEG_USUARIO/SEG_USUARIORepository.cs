using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace sguees.Repositories
{
	public class SEG_USUARIORepository : BaseRepository<SEG_USUARIOTable>, ISEG_USUARIORepository
	{
		private const string _TableName = "SEG_USUARIO";
		// private readonly IConfiguration _config;   
		public SEG_USUARIORepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_" + _TableName, xWhere);
				var response = new List<SEG_USUARIOView>().FromDataReader(reader).ToList();

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

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<SEG_USUARIOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				if (response == null)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "No se encontraron datos";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
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

		public async Task<CResult> GetUsuarioAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();
			try
			{
				
				var reader = await objData.GetDataReader("V_" + _TableName + "_CLASS", xWhere);
				var response = new List<SEG_USUARIOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				if (response == null)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "Usuario no encontrado";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
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

		public async Task<CResult> CreateAsync(SEG_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			byte[] CLAVE_USUARIOHash, CLAVE_USUARIO_SAL;
			CreatePasswordHash(Data.LOGIN_SISTEMA, out CLAVE_USUARIOHash, out CLAVE_USUARIO_SAL);

			Data.CLAVE_USUARIO = CLAVE_USUARIOHash;
			Data.CLAVE_USUARIO_SAL = CLAVE_USUARIO_SAL;
			try
			{

				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = 1, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@NOMBRE_USUARIO", Value = Data.NOMBRE_USUARIO, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CLAVE_USUARIO", Value = Data.CLAVE_USUARIO, DbType = System.Data.DbType.Binary });
				p.Add(new CParameter() { ParameterName = "@CLAVE_USUARIO_SAL", Value = Data.CLAVE_USUARIO_SAL, DbType = System.Data.DbType.Binary });
				p.Add(new CParameter() { ParameterName = "@CORREO_ELECTRONICO", Value = Data.CORREO_ELECTRONICO, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@TIPO_USUARIO", Value = Data.TIPO_USUARIO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ESTADO_USUARIO", Value = Data.ESTADO_USUARIO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@IDIOMA", Value = Data.IDIOMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_AD", Value = Data.USUARIO_AD, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String });

				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = System.Data.DbType.String });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<SEG_USUARIOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.LOGIN_SISTEMA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (string)objData.objCommand.Parameters["@LOGIN_SISTEMA"].Value;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Add.ToString() + ")";
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

		public async Task<CResult> UpdateAsync(SEG_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = 2, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@NOMBRE_USUARIO", Value = Data.NOMBRE_USUARIO, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CORREO_ELECTRONICO", Value = Data.CORREO_ELECTRONICO, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@TIPO_USUARIO", Value = Data.TIPO_USUARIO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ESTADO_USUARIO", Value = Data.ESTADO_USUARIO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@IDIOMA", Value = Data.IDIOMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_AD", Value = Data.USUARIO_AD, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String });

				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = System.Data.DbType.String });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<SEG_USUARIOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.LOGIN_SISTEMA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (string)objData.objCommand.Parameters["@LOGIN_SISTEMA"].Value;
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

		public async Task<CResult> DeleteAsync(SEG_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = 3, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@NOMBRE_USUARIO", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CORREO_ELECTRONICO", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@TIPO_USUARIO", Value = 0, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ESTADO_USUARIO", Value = 0, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@IDIOMA", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_CREA", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_CREA", Value = DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_CREA", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = "", DbType = System.Data.DbType.String });

				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<SEG_USUARIOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.LOGIN_SISTEMA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (string)objData.objCommand.Parameters["@LOGIN_SISTEMA"].Value;
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
		private void CreatePasswordHash(string CLAVE_USUARIO, out byte[] CLAVE_USUARIOHash, out byte[] CLAVE_USUARIO_SAL)
		{
			using (var hmac = new System.Security.Cryptography.HMACSHA512())
			{
				CLAVE_USUARIO_SAL = hmac.Key;
				CLAVE_USUARIOHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(CLAVE_USUARIO));
			}
		}
		public async Task<CResult> CambioClave(SEG_USUARIO_LOGINParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			var p = new List<CParameter>();
			byte[] CLAVE_USUARIOHash, CLAVE_USUARIO_SAL;
			try
			{
				CreatePasswordHash(Data.CLAVE_USUARIO_NUEVA, out CLAVE_USUARIOHash, out CLAVE_USUARIO_SAL);

				p.Add(new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@CLAVE_USUARIO", Value = CLAVE_USUARIOHash, DbType = System.Data.DbType.Binary });
				p.Add(new CParameter() { ParameterName = "@CLAVE_USUARIO_SAL", Value = CLAVE_USUARIO_SAL, DbType = System.Data.DbType.Binary });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String });

				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName + "_CAMBIO_CLAVE", true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{

					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = (string)objData.objCommand.Parameters["@LOGIN_SISTEMA"].Value;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (string)objData.objCommand.Parameters["@LOGIN_SISTEMA"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".CambioClaver";
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
		public async Task<CResult> RestablecerContrasenaAsync(SEG_USUARIOTable Data, string nuevaContrasena, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			byte[] CLAVE_USUARIOHash, CLAVE_USUARIO_SAL;
			
			// Generar hash de la contraseña (nuevaContrasena que es el LOGIN_SISTEMA)
			CreatePasswordHash(nuevaContrasena, out CLAVE_USUARIOHash, out CLAVE_USUARIO_SAL);

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@CLAVE_USUARIO", Value = CLAVE_USUARIOHash, DbType = System.Data.DbType.Binary });
				p.Add(new CParameter() { ParameterName = "@CLAVE_USUARIO_SAL", Value = CLAVE_USUARIO_SAL, DbType = System.Data.DbType.Binary });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String });

				// Parámetros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName + "_CAMBIO_CLAVE", true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					objResultado.Data = Data.LOGIN_SISTEMA;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = $"Contraseña restablecida exitosamente. Nueva contraseña: {Data.LOGIN_SISTEMA}";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "SEG_USUARIO.RestablecerContrasena";
				}
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

		public async Task<bool> VerificarPrimerLoginAsync(string loginSistema)
		{
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = loginSistema, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@ES_PRIMER_LOGIN", Value = false, DbType = System.Data.DbType.Boolean, Direction = System.Data.ParameterDirection.Output });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_DATA_SEG_USUARIO_PRIMER_LOGIN", true, p);

				return (bool)objData.objCommand.Parameters["@ES_PRIMER_LOGIN"].Value;
			}
			catch
			{
				return false;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		public async Task<CResult> RegistrarLoginHistorialAsync(string loginSistema, string ipAddress, string navegador, string codigoSuite, bool exitoso, string mensaje)
		{
			CResult objResultado = new CResult();
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = loginSistema, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@IP_ADDRESS", Value = ipAddress, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@NAVEGADOR", Value = navegador, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CODIGO_SUITE", Value = codigoSuite, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@EXITOSO", Value = exitoso, DbType = System.Data.DbType.Boolean });
				p.Add(new CParameter() { ParameterName = "@MENSAJE", Value = mensaje, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CORR_LOGIN", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.Output });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_SEG_USUARIO_LOGIN_HISTORIAL", true, p);

				objResultado.Result = true;
				objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_LOGIN"].Value;
				objResultado.ErrorCode = 0;
			}
			catch (System.Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}
			return objResultado;
		}

		public async Task<SEG_USUARIO_EXPIRACION_CLAVEView> ValidarExpiracionClaveAsync(string loginSistema)
		{
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = loginSistema, DbType = System.Data.DbType.String });

				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE", p);
				var response = new List<SEG_USUARIO_EXPIRACION_CLAVEView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				return response ?? new SEG_USUARIO_EXPIRACION_CLAVEView 
				{ 
					LOGIN_SISTEMA = loginSistema, 
					REQUIERE_CAMBIO_CLAVE = false,
					MENSAJE = "No se pudo validar expiración de contraseña"
				};
			}
			catch
			{
				return new SEG_USUARIO_EXPIRACION_CLAVEView 
				{ 
					LOGIN_SISTEMA = loginSistema, 
					REQUIERE_CAMBIO_CLAVE = false,
					MENSAJE = "Error al validar expiración de contraseña"
				};
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

	}
}
