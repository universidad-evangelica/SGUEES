// Qué hace: acceso a datos de empleados y persona natural vía SP.
// Cómo lo hace: GetAll/Get/Create/Update de GEN_EMPLEADO; personales con PRAL_MTTO_GEN_PERSONA_NATURAL.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_EMPLEADORepository : BaseRepository<GEN_EMPLEADOTable>, IGEN_EMPLEADORepository
	{
		private const string _TableName = "GEN_EMPLEADO";
		private const string _ViewName = "V_GEN_EMPLEADO";
		private const string _ViewPersonaNatural = "V_GEN_PERSONA_NATURAL";
		private const string _SpPersonaNatural = "PRAL_MTTO_GEN_PERSONA_NATURAL";

		public GEN_EMPLEADORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_EMPLEADOView>().FromDataReader(reader).ToList();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
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

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_EMPLEADOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response != null ? 1 : 0;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
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

		// Qué hace: obtiene persona natural por CORR_PERSONA o CORR_PERSONA_NATURAL.
		// Cómo: lee V_GEN_PERSONA_NATURAL.
		public async Task<CResult> GetPersonaNaturalAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewPersonaNatural, xWhere);
				var response = new List<GEN_PERSONA_NATURALView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response != null ? 1 : 0;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
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

		// Qué hace: Insert/Update/Delete de persona natural (y alta persona/empresa en Insert).
		// Cómo: ExecCmd PRAL_MTTO_GEN_PERSONA_NATURAL y relee V_GEN_PERSONA_NATURAL.
		public async Task<CResult> MttoPersonaNaturalAsync(
			GEN_PERSONA_NATURALTable Data,
			int tipoActualiza,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildPersonaNaturalSpParams(Data, tipoActualiza, corrEmpresa, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, _SpPersonaNatural, true, p);

				var errorCode = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value ?? 0);
				var errorMsg = Convert.ToString(objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value ?? string.Empty);
				var rowsAffected = Convert.ToInt32(objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value ?? 0);

				Data.CORR_PERSONA = Convert.ToInt64(objData.objCommand.Parameters["@CORR_PERSONA"].Value ?? 0L);
				Data.CORR_PERSONA_NATURAL = Convert.ToInt64(objData.objCommand.Parameters["@CORR_PERSONA_NATURAL"].Value ?? 0L);

				if (errorCode != 0)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMsg;
					objResultado.ErrorSource = "[GEN_EMPLEADORepository.MttoPersonaNaturalAsync]";
					return objResultado;
				}

				if (tipoActualiza == (int)UpdateType.Delete)
				{
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = rowsAffected;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					return objResultado;
				}

				var xWhere = new List<CParameter>
				{
					new CParameter()
					{
						ParameterName = "CORR_PERSONA_NATURAL",
						Value = Data.CORR_PERSONA_NATURAL,
						DbType = System.Data.DbType.Int64,
					},
				};

				var reader = await objData.GetDataReader(_ViewPersonaNatural, xWhere);
				var response = new List<GEN_PERSONA_NATURALView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = rowsAffected;
				objResultado.CodeHelper = (int)(response?.CORR_PERSONA_NATURAL ?? Data.CORR_PERSONA_NATURAL);
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
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

		public async Task<CResult> CreateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				if (Data.CORR_EMPLEADO <= 0)
				{
					Data.CORR_EMPLEADO = await GetNextCorrEmpleadoAsync(Data.CORR_EMPRESA);
				}

				if (string.IsNullOrWhiteSpace(Data.CODIGO_EMPLEADO))
				{
					Data.CODIGO_EMPLEADO = Data.CORR_EMPLEADO.ToString();
				}

				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.Input },
					new CParameter() { ParameterName = "CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.Input },
					new CParameter() { ParameterName = "CORR_PERSONA", Value = Data.CORR_PERSONA, DbType = System.Data.DbType.Int64 },
					new CParameter() { ParameterName = "CODIGO_EMPLEADO", Value = Data.CODIGO_EMPLEADO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_SEGURO_SOCIAL", Value = Data.CORR_SEGURO_SOCIAL, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ESTADO_NIP", Value = Data.ESTADO_NIP, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_AFP", Value = Data.CORR_AFP, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "FECHA_AFILIACION_AFP", Value = Data.FECHA_AFILIACION_AFP, DbType = System.Data.DbType.Date },
					new CParameter() { ParameterName = "FECHA_INGRESO", Value = Data.FECHA_INGRESO, DbType = System.Data.DbType.Date },
					new CParameter() { ParameterName = "CORREO_INSTITUCIONAL", Value = Data.CORREO_INSTITUCIONAL, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "TELEFONO_INSTITUCIONAL", Value = Data.TELEFONO_INSTITUCIONAL, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ACTIVO_EMPLEADO", Value = Data.ACTIVO_EMPLEADO ?? true, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, string.Empty, pWhere);
				var response = new List<GEN_EMPLEADOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_EMPLEADO ?? Data.CORR_EMPLEADO;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				var duplicateKey = IsDuplicateKeyError(e);
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = duplicateKey ? 2627 : -1;
				objResultado.ErrorMessage = duplicateKey
					? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> UpdateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PERSONA", Value = Data.CORR_PERSONA, DbType = System.Data.DbType.Int64 },
					new CParameter() { ParameterName = "CODIGO_EMPLEADO", Value = Data.CODIGO_EMPLEADO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_SEGURO_SOCIAL", Value = Data.CORR_SEGURO_SOCIAL, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ESTADO_NIP", Value = Data.ESTADO_NIP, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_AFP", Value = Data.CORR_AFP, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "FECHA_AFILIACION_AFP", Value = Data.FECHA_AFILIACION_AFP, DbType = System.Data.DbType.Date },
					new CParameter() { ParameterName = "FECHA_INGRESO", Value = Data.FECHA_INGRESO, DbType = System.Data.DbType.Date },
					new CParameter() { ParameterName = "CORREO_INSTITUCIONAL", Value = Data.CORREO_INSTITUCIONAL, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "TELEFONO_INSTITUCIONAL", Value = Data.TELEFONO_INSTITUCIONAL, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ACTIVO_EMPLEADO", Value = Data.ACTIVO_EMPLEADO, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<GEN_EMPLEADOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_EMPLEADO ?? Data.CORR_EMPLEADO;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				var duplicateKey = IsDuplicateKeyError(e);
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = duplicateKey ? 2627 : -1;
				objResultado.ErrorMessage = duplicateKey
					? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: elimina un empleado de la empresa.
		// Cómo: Delete por CORR_EMPRESA + CORR_EMPLEADO; si hay FK informa registros asociados.
		public async Task<CResult> DeleteAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_EMPLEADO;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = "No se puede eliminar el empleado porque tiene registros asociados en otras tablas.";
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private static List<CParameter> BuildPersonaNaturalSpParams(
			GEN_PERSONA_NATURALTable Data,
			int tipoActualiza,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = tipoActualiza, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_PERSONA", Value = Data.CORR_PERSONA ?? 0L, DbType = System.Data.DbType.Int64, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@CORR_PERSONA_NATURAL", Value = Data.CORR_PERSONA_NATURAL, DbType = System.Data.DbType.Int64, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@CODIGO_PERSONA", Value = (object)DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@ACTIVO_PERSONA", Value = true, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "@PRIMER_NOMBRE", Value = Data.PRIMER_NOMBRE, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@SEGUNDO_NOMBRE", Value = Data.SEGUNDO_NOMBRE, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@PRIMER_APELLIDO", Value = Data.PRIMER_APELLIDO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@SEGUNDO_APELLIDO", Value = Data.SEGUNDO_APELLIDO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@APELLIDO_CASADA", Value = Data.APELLIDO_CASADA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@FOTO_URL", Value = Data.FOTO_URL, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@SEXO", Value = Data.SEXO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@ESTADO_CIVIL", Value = Data.ESTADO_CIVIL, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@NACIONALIDAD", Value = Data.NACIONALIDAD, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@EDAD", Value = Data.EDAD, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@FECHA_NACIMIENTO", Value = Data.FECHA_NACIMIENTO, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "@ES_JUBILADO", Value = Data.ES_JUBILADO ?? false, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "@POSEE_DISCAPACIDAD", Value = Data.POSEE_DISCAPACIDAD ?? false, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "@TIPO_DISCAPACIDAD", Value = Data.TIPO_DISCAPACIDAD, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@CORR_RELIGION", Value = Data.CORR_RELIGION, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@IGLESIA_CONGREGA", Value = Data.IGLESIA_CONGREGA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@CARTA_PASTORAL", Value = Data.CARTA_PASTORAL, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@ES_EXTRANJERO", Value = Data.ES_EXTRANJERO ?? false, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "@DOMICILIADO", Value = Data.DOMICILIADO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@CORR_PAIS_NACIMIENTO", Value = Data.CORR_PAIS_NACIMIENTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_DEPTO_NACIMIENTO", Value = Data.CORR_DEPTO_NACIMIENTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_MUNICIPIO_NACIMIENTO", Value = Data.CORR_MUNICIPIO_NACIMIENTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_DISTRITO_NACIMIENTO", Value = Data.CORR_DISTRITO_NACIMIENTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_ORIGEN_INGRESO", Value = Data.CORR_ORIGEN_INGRESO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_TIPO_CONTRIBUYENTE", Value = Data.CORR_TIPO_CONTRIBUYENTE, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_ACTIVIDAD_ECONOMICA", Value = Data.CORR_ACTIVIDAD_ECONOMICA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				// Int32 (como BAN_CHEQUERA): Decimal sin precision 38 provoca "Error al convertir numeric a numeric".
				new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
			};
		}

		private async Task<int> GetNextCorrEmpleadoAsync(int corrEmpresa)
		{
			if (corrEmpresa <= 0)
			{
				return 1;
			}

			const string sql = @"SELECT ISNULL(MAX(CORR_EMPLEADO), 0) + 1 AS NEXT_CORR
				FROM GEN_EMPLEADO
				WHERE CORR_EMPRESA = @CORR_EMPRESA";

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				});

				var next = 1;
				if (reader.Read() && !reader.IsDBNull(0))
				{
					next = Convert.ToInt32(reader.GetValue(0));
					if (next < 1)
					{
						next = 1;
					}
				}

				reader.Close();
				return next;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
		}
	}
}
