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

		public async Task<CResult> RegistrarLoginHistorialAsync(string loginSistema, string ipAddress, string navegador, string codigoSuite, bool exitoso, string mensaje, bool esCambioClave = false)
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
			p.Add(new CParameter() { ParameterName = "@ES_CAMBIO_CLAVE", Value = esCambioClave, DbType = System.Data.DbType.Boolean });
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

		public async Task<List<SEG_USUARIO_CLAVE_HISTORIALView>> GetUltimasClavesAsync(string loginSistema, int numeroUltimasClaves)
		{
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = loginSistema, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@NUMERO_ULTIMAS_CLAVES", Value = numeroUltimasClaves, DbType = System.Data.DbType.Int32 });

				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_SEG_USUARIO_VALIDAR_CLAVE_ANTERIOR", p);
				var response = new List<SEG_USUARIO_CLAVE_HISTORIALView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				return response;
			}
			catch
			{
				return new List<SEG_USUARIO_CLAVE_HISTORIALView>();
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		public async Task<System.DateTime?> GetUltimoAccesoExitosoAsync(string loginSistema)
		{
			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@LOGIN_SISTEMA", Value = loginSistema, DbType = System.Data.DbType.String },
				};

				const string sql = @"
SELECT TOP 1 FECHA_LOGIN
FROM SEG_USUARIO_LOGIN_HISTORIAL
WHERE LOGIN_SISTEMA = @LOGIN_SISTEMA
  AND EXITOSO = 1
ORDER BY FECHA_LOGIN DESC";

				var result = await objData.ExecCmd(System.Data.CommandType.Text, sql, false, p);
				if (result == null || result == System.DBNull.Value)
				{
					return null;
				}

				return System.Convert.ToDateTime(result);
			}
			catch
			{
				return null;
			}
		}

		public async Task<string> GetNombreEmpresaAsync(int corrEmpresa)
		{
			if (corrEmpresa <= 0)
			{
				return string.Empty;
			}

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				};

				const string sql = @"
SELECT TOP 1 NOMBRE_EMPRESA
FROM GEN_EMPRESA
WHERE CORR_EMPRESA = @CORR_EMPRESA";

				var result = await objData.ExecCmd(System.Data.CommandType.Text, sql, false, p);
				return result == null || result == System.DBNull.Value
					? string.Empty
					: System.Convert.ToString(result)?.Trim() ?? string.Empty;
			}
			catch
			{
				return string.Empty;
			}
		}

		// Qué hace: obtiene la persona natural asociada a un usuario del sistema (1 a 1).
		// Cómo lo hace: ejecuta consulta SQL sobre GEN_PERSONA_USUARIO uniendo con GEN_PERSONA_NATURAL, GEN_EMPLEADO y tipos de rol.
		public async Task<CResult> GetPersonaAsignadaAsync(string loginSistema)
		{
			var objResultado = new CResult();
			try
			{
				const string sql = @"
SELECT 
    PU.CORR_PERSONA,
    PU.LOGIN_SISTEMA,
    PN.CORR_PERSONA_NATURAL,
    PN.NOMBRE_COMPLETO,
    PN.PRIMER_NOMBRE,
    PN.PRIMER_APELLIDO,
    ISNULL(PN.SEXO, '') AS SEXO,
    ISNULL(P.ACTIVO_PERSONA, 1) AS ACTIVO_PERSONA,
    ISNULL(PN.FOTO_URL, '') AS FOTO_URL,
    CASE 
        WHEN E.CORR_EMPLEADO IS NOT NULL THEN 'EMPLEADO'
        -- WHEN PRU.CORR_PROVEEDOR IS NOT NULL THEN 'PROVEEDOR'
        -- WHEN CLU.CORR_CLIENTE IS NOT NULL THEN 'CLIENTE'
        WHEN EST.CIF IS NOT NULL THEN 'ESTUDIANTE'
        WHEN EXISTS (
            SELECT 1 FROM dbo.SC_PERSONA_DATOS SC 
            WHERE (SC.DUI IS NOT NULL AND SC.DUI <> '' AND EXISTS (
                SELECT 1 FROM dbo.GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD TDI 
                WHERE TDI.CORR_PERSONA = PN.CORR_PERSONA AND TDI.VALOR_DOCUMENTO = SC.DUI
            )) OR (SC.NOMBRE1 + ' ' + SC.APELLIDO1 = PN.NOMBRE_COMPLETO)
        ) THEN 'CANDIDATO'
        WHEN EXISTS (
            SELECT 1 FROM dbo.ACA_PROSPECTO_PERSONA AP 
            WHERE (AP.DUI IS NOT NULL AND AP.DUI <> '' AND EXISTS (
                SELECT 1 FROM dbo.GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD TDI 
                WHERE TDI.CORR_PERSONA = PN.CORR_PERSONA AND TDI.VALOR_DOCUMENTO = AP.DUI
            )) OR (AP.NOMBRES + ' ' + AP.APELLIDO1 = PN.NOMBRE_COMPLETO)
        ) THEN 'ASPIRANTE'
        ELSE 'PERSONA NATURAL'
    END AS TIPO_PERSONA,
    COALESCE(
        (SELECT TOP 1 TDI.VALOR_DOCUMENTO 
         FROM dbo.GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD TDI 
         WHERE TDI.CORR_PERSONA = PU.CORR_PERSONA 
         ORDER BY TDI.CORR_TIPO_DOCUMENTO_IDENTIDAD), 
        ''
    ) AS DUI,
    PU.FECHA_CREA AS FECHA_ASOCIACION
FROM dbo.GEN_PERSONA_USUARIO PU
INNER JOIN dbo.GEN_PERSONA P ON PU.CORR_PERSONA = P.CORR_PERSONA
INNER JOIN dbo.GEN_PERSONA_NATURAL PN ON P.CORR_PERSONA = PN.CORR_PERSONA
LEFT JOIN dbo.GEN_EMPLEADO E ON P.CORR_PERSONA = E.CORR_PERSONA AND E.ACTIVO_EMPLEADO = 1
-- LEFT JOIN dbo.GEN_PROVEEDOR_USUARIO PRU ON PU.LOGIN_SISTEMA = PRU.LOGIN_SISTEMA
-- LEFT JOIN dbo.GEN_CLIENTE_USUARIO CLU ON PU.LOGIN_SISTEMA = CLU.LOGIN_SISTEMA
LEFT JOIN dbo.ACA_AUTH_ESTUDIANTE EST ON EST.CORREO = (SELECT CORREO_ELECTRONICO FROM dbo.SEG_USUARIO WHERE LOGIN_SISTEMA = PU.LOGIN_SISTEMA)
WHERE PU.LOGIN_SISTEMA = @LOGIN_SISTEMA;";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@LOGIN_SISTEMA", Value = loginSistema ?? string.Empty, DbType = System.Data.DbType.String }
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				var response = new List<SEG_USUARIO_PERSONA_ASIGNADAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response != null ? 1 : 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = string.Empty;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource = $"{nameof(SEG_USUARIORepository)}.{nameof(GetPersonaAsignadaAsync)}";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: obtiene el catálogo de personas naturales disponibles para asociar al usuario.
		// Cómo lo hace: consulta GEN_PERSONA_NATURAL excluyendo la persona asociada al usuario actual (@LOGIN_SISTEMA) y filtrando por nombre o DUI.
		public async Task<CResult> GetPersonasNaturalesDisponiblesAsync(string buscar, string loginSistema = null)
		{
			var objResultado = new CResult();
			try
			{
				const string sql = @"
SELECT 
    PN.CORR_PERSONA,
    PN.CORR_PERSONA_NATURAL,
    PN.NOMBRE_COMPLETO,
    ISNULL(PN.SEXO, '') AS SEXO,
    ISNULL(P.ACTIVO_PERSONA, 1) AS ACTIVO_PERSONA,
    CASE 
        WHEN E.CORR_EMPLEADO IS NOT NULL THEN 'EMPLEADO'
        WHEN PR.CORR_PROVEEDOR IS NOT NULL THEN 'PROVEEDOR'
        WHEN EXISTS (
            SELECT 1 FROM dbo.SC_PERSONA_DATOS SC 
            WHERE (SC.DUI IS NOT NULL AND SC.DUI <> '' AND EXISTS (
                SELECT 1 FROM dbo.GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD TDI 
                WHERE TDI.CORR_PERSONA = PN.CORR_PERSONA AND TDI.VALOR_DOCUMENTO = SC.DUI
            )) OR (SC.NOMBRE1 + ' ' + SC.APELLIDO1 = PN.NOMBRE_COMPLETO)
        ) THEN 'CANDIDATO'
        WHEN EXISTS (
            SELECT 1 FROM dbo.ACA_PROSPECTO_PERSONA AP 
            WHERE (AP.DUI IS NOT NULL AND AP.DUI <> '' AND EXISTS (
                SELECT 1 FROM dbo.GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD TDI 
                WHERE TDI.CORR_PERSONA = PN.CORR_PERSONA AND TDI.VALOR_DOCUMENTO = AP.DUI
            )) OR (AP.NOMBRES + ' ' + AP.APELLIDO1 = PN.NOMBRE_COMPLETO)
        ) THEN 'ASPIRANTE'
        ELSE 'PERSONA NATURAL'
    END AS TIPO_PERSONA,
    COALESCE(
        (SELECT TOP 1 TDI.VALOR_DOCUMENTO 
         FROM dbo.GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD TDI 
         WHERE TDI.CORR_PERSONA = PN.CORR_PERSONA 
         ORDER BY TDI.CORR_TIPO_DOCUMENTO_IDENTIDAD), 
        ''
    ) AS DUI,
    PU.LOGIN_SISTEMA AS USUARIO_ASIGNADO
FROM dbo.GEN_PERSONA_NATURAL PN
LEFT JOIN dbo.GEN_PERSONA P ON PN.CORR_PERSONA = P.CORR_PERSONA
LEFT JOIN dbo.GEN_EMPLEADO E ON PN.CORR_PERSONA = E.CORR_PERSONA AND E.ACTIVO_EMPLEADO = 1
LEFT JOIN dbo.COM_PROVEEDOR PR ON PR.TIPO_PERSONERIA = 'NATURAL' AND PR.NOMBRE_PROVEEDOR LIKE '%' + PN.PRIMER_APELLIDO + '%'
LEFT JOIN dbo.GEN_PERSONA_USUARIO PU ON PN.CORR_PERSONA = PU.CORR_PERSONA
WHERE LTRIM(RTRIM(ISNULL(PN.NOMBRE_COMPLETO, ''))) <> ''
  AND (@LOGIN_SISTEMA IS NULL OR @LOGIN_SISTEMA = '' OR NOT EXISTS (
      SELECT 1 FROM dbo.GEN_PERSONA_USUARIO PU_ACT 
      WHERE PU_ACT.CORR_PERSONA = PN.CORR_PERSONA 
        AND PU_ACT.LOGIN_SISTEMA = @LOGIN_SISTEMA
  ))
  AND (@BUSCAR IS NULL OR @BUSCAR = '' OR PN.NOMBRE_COMPLETO LIKE '%' + @BUSCAR + '%' OR EXISTS (
      SELECT 1 FROM dbo.GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD TDI 
      WHERE TDI.CORR_PERSONA = PN.CORR_PERSONA AND TDI.VALOR_DOCUMENTO LIKE '%' + @BUSCAR + '%'
  ))
ORDER BY PN.NOMBRE_COMPLETO;";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@BUSCAR", Value = buscar ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@LOGIN_SISTEMA", Value = loginSistema ?? string.Empty, DbType = System.Data.DbType.String }
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				var response = new List<SEG_USUARIO_PERSONA_ASIGNADAView>().FromDataReader(reader).ToList();
				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = string.Empty;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource = $"{nameof(SEG_USUARIORepository)}.{nameof(GetPersonasNaturalesDisponiblesAsync)}";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: asocia una persona natural a un usuario garantizando relación 1 a 1 y que la persona esté activa.
		// Cómo lo hace: valida que la persona no esté inactiva, elimina asociación previa e inserta la vinculación en GEN_PERSONA_USUARIO.
		public async Task<CResult> AsociarPersonaAsync(string loginSistema, long corrPersona, string usuario, string estacion)
		{
			var objResultado = new CResult();
			try
			{
				const string sql = @"
IF EXISTS (SELECT 1 FROM dbo.GEN_PERSONA WHERE CORR_PERSONA = @CORR_PERSONA AND ISNULL(ACTIVO_PERSONA, 1) = 0)
BEGIN
    RAISERROR('No se puede asociar esta persona al usuario porque se encuentra inactiva.', 16, 1);
    RETURN;
END

DELETE FROM dbo.GEN_PERSONA_USUARIO WHERE LOGIN_SISTEMA = @LOGIN_SISTEMA OR CORR_PERSONA = @CORR_PERSONA;

INSERT INTO dbo.GEN_PERSONA_USUARIO (
    CORR_PERSONA, 
    LOGIN_SISTEMA, 
    USUARIO_CREA, 
    ESTACION_CREA, 
    FECHA_CREA, 
    USUARIO_ACTU, 
    ESTACION_ACTU, 
    FECHA_ACTU
) VALUES (
    @CORR_PERSONA, 
    @LOGIN_SISTEMA, 
    @USUARIO, 
    @ESTACION, 
    GETDATE(), 
    @USUARIO, 
    @ESTACION, 
    GETDATE()
);";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@LOGIN_SISTEMA", Value = loginSistema, DbType = System.Data.DbType.String },
					new() { ParameterName = "@CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
					new() { ParameterName = "@USUARIO", Value = usuario ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@ESTACION", Value = estacion ?? string.Empty, DbType = System.Data.DbType.String }
				};

				await objData.ExecCmd(System.Data.CommandType.Text, sql, false, p);

				// Releer el registro completo recién asociado para devolverlo en Data
				return await GetPersonaAsignadaAsync(loginSistema);
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource = $"{nameof(SEG_USUARIORepository)}.{nameof(AsociarPersonaAsync)}";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: elimina la asociación entre la persona natural y el usuario.
		// Cómo lo hace: ejecuta DELETE en GEN_PERSONA_USUARIO filtrando por LOGIN_SISTEMA.
		public async Task<CResult> DesasociarPersonaAsync(string loginSistema)
		{
			var objResultado = new CResult();
			try
			{
				const string sql = @"DELETE FROM dbo.GEN_PERSONA_USUARIO WHERE LOGIN_SISTEMA = @LOGIN_SISTEMA;";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@LOGIN_SISTEMA", Value = loginSistema, DbType = System.Data.DbType.String }
				};

				await objData.ExecCmd(System.Data.CommandType.Text, sql, false, p);

				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = string.Empty;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource = $"{nameof(SEG_USUARIORepository)}.{nameof(DesasociarPersonaAsync)}";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

	}
}
