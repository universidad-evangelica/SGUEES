// Qué hace: acceso a datos de empleados y núcleo vía SP.
// Cómo lo hace: GetAll/Get/Create/Update de GEN_EMPLEADO; Iniciar/Personales con PRAL_MTTO_GEN_EMPLEADO.
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
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
		private const string _CampoPk = "CORR_EMPLEADO";
		private const string _CampoEstado = "ACTIVO_EMPLEADO";
		private const bool _UsaEmpresa = true;
		private const string _ViewPersonaNatural = "V_GEN_PERSONA_NATURAL";
		private const string _SpEmpleado = "PRAL_MTTO_GEN_EMPLEADO";
		private readonly string _connectionString;

		public GEN_EMPLEADORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
			_connectionString = config.GetConnectionString("defaultConnection") ?? string.Empty;
		}

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

		// Qué hace: Insert/Update/Delete núcleo empleado (persona + natural + empleado).
		// Cómo: ExecCmd PRAL_MTTO_GEN_EMPLEADO; Insert/Update relee V_GEN_EMPLEADO o V_GEN_PERSONA_NATURAL.
		public async Task<CResult> MttoEmpleadoAsync(
			GEN_EMPLEADO_MTTOTable Data,
			int tipoActualiza,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				Data ??= new GEN_EMPLEADO_MTTOTable();
				var p = BuildEmpleadoSpParams(Data, tipoActualiza, corrEmpresa, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, _SpEmpleado, true, p);

				var errorCode = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value ?? 0);
				var errorMsg = Convert.ToString(objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value ?? string.Empty);
				var rowsAffected = Convert.ToInt32(objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value ?? 0);

				Data.CORR_EMPLEADO = Convert.ToInt32(objData.objCommand.Parameters["@CORR_EMPLEADO"].Value ?? 0);
				Data.CORR_PERSONA = Convert.ToInt64(objData.objCommand.Parameters["@CORR_PERSONA"].Value ?? 0L);
				Data.CORR_PERSONA_NATURAL = Convert.ToInt64(objData.objCommand.Parameters["@CORR_PERSONA_NATURAL"].Value ?? 0L);

				if (errorCode != 0)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMsg;
					objResultado.ErrorSource = "[GEN_EMPLEADORepository.MttoEmpleadoAsync]";
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

				if (tipoActualiza == (int)UpdateType.Add)
				{
					var xWhereEmp = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
					};
					var readerEmp = await objData.GetDataReader(_ViewName, xWhereEmp);
					var empleado = new List<GEN_EMPLEADOView>().FromDataReader(readerEmp).FirstOrDefault();
					readerEmp.Close();

					objResultado.Data = empleado;
					objResultado.Result = true;
					objResultado.RowsAffected = rowsAffected;
					objResultado.CodeHelper = empleado?.CORR_EMPLEADO ?? Data.CORR_EMPLEADO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					return objResultado;
				}

				var xWhereNat = new List<CParameter>
				{
					new CParameter()
					{
						ParameterName = "CORR_PERSONA_NATURAL",
						Value = Data.CORR_PERSONA_NATURAL,
						DbType = System.Data.DbType.Int64,
					},
				};
				var readerNat = await objData.GetDataReader(_ViewPersonaNatural, xWhereNat);
				var natural = new List<GEN_PERSONA_NATURALView>().FromDataReader(readerNat).FirstOrDefault();
				readerNat.Close();

				objResultado.Data = natural;
				objResultado.Result = true;
				objResultado.RowsAffected = rowsAffected;
				objResultado.CodeHelper = (int)(natural?.CORR_PERSONA_NATURAL ?? Data.CORR_PERSONA_NATURAL);
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
					new CParameter() { ParameterName = "FECHA_INCORPORACION_SP", Value = Data.FECHA_INCORPORACION_SP, DbType = System.Data.DbType.Date },
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
					new CParameter() { ParameterName = "FECHA_INCORPORACION_SP", Value = Data.FECHA_INCORPORACION_SP, DbType = System.Data.DbType.Date },
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

		// Qué hace: elimina el empleado, su persona y el expediente.
		// Cómo lo hace: si tiene puesto o carga de descriptor no borra nada y avisa; si no,
		// borra historial, rubro, el empleado y las tablas de la persona en la misma transacción.
		public async Task<CResult> DeleteAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				if (await TienePuestoOCargaDescriptorAsync(Data.CORR_EMPRESA, Data.CORR_EMPLEADO))
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = 4102;
					objResultado.ErrorMessage = "No se puede eliminar el empleado porque tiene registros asociados en otras tablas.";
					objResultado.ErrorSource = "";
					return objResultado;
				}

				await EliminarEmpleadoYPersonaAsync(Data.CORR_EMPRESA, Data.CORR_EMPLEADO);
				objResultado.RowsAffected = 1;
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

		// Qué hace: indica si el empleado tiene puesto o carga en un descriptor.
		// Cómo lo hace: busca una fila en GEN_EMPLEADO_PUESTO o SC_DESCRIPTOR_PUESTO_EMPLEADO.
		private async Task<bool> TienePuestoOCargaDescriptorAsync(int corrEmpresa, int corrEmpleado)
		{
			const string sql = @"
            SELECT CASE WHEN EXISTS (
                SELECT 1
                FROM dbo.GEN_EMPLEADO_PUESTO
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                  AND CORR_EMPLEADO = @CORR_EMPLEADO
            ) OR EXISTS (
                SELECT 1
                FROM dbo.SC_DESCRIPTOR_PUESTO_EMPLEADO
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                  AND CORR_EMPLEADO = @CORR_EMPLEADO
            ) THEN 1 ELSE 0 END;";

			await using var conn = new SqlConnection(_connectionString);
			await conn.OpenAsync();
			await using var cmd = new SqlCommand(sql, conn);
			cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = corrEmpresa });
			cmd.Parameters.Add(new SqlParameter("@CORR_EMPLEADO", SqlDbType.Int) { Value = corrEmpleado });
			var encontrado = await cmd.ExecuteScalarAsync();
			return encontrado != null && encontrado != DBNull.Value && Convert.ToInt32(encontrado) == 1;
		}

		// Qué hace: borra historial, rubro, empleado y la persona.
		// Cómo lo hace: solo llega aquí si no hay puesto ni carga. Si falla, no queda nada a medias.
		private async Task EliminarEmpleadoYPersonaAsync(int corrEmpresa, int corrEmpleado)
		{
			const string sql = @"
            SET XACT_ABORT ON;
            BEGIN TRAN;

            DECLARE @CORR_PERSONA BIGINT;

            SELECT @CORR_PERSONA = CORR_PERSONA
            FROM dbo.GEN_EMPLEADO
            WHERE CORR_EMPRESA = @CORR_EMPRESA
              AND CORR_EMPLEADO = @CORR_EMPLEADO;

            DELETE FROM dbo.GEN_EMPLEADO_PUESTO_HISTORIAL
            WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_EMPLEADO = @CORR_EMPLEADO;

            DELETE FROM dbo.PLA_RUBRO_MENSUAL
            WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_EMPLEADO = @CORR_EMPLEADO;

            DELETE FROM dbo.GEN_EMPLEADO
            WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_EMPLEADO = @CORR_EMPLEADO;

            IF @CORR_PERSONA IS NOT NULL AND @CORR_PERSONA > 0
               AND NOT EXISTS (
                    SELECT 1
                    FROM dbo.GEN_EMPLEADO
                    WHERE CORR_PERSONA = @CORR_PERSONA
               )
            BEGIN
                DELETE FROM dbo.GEN_PERSONA_CONTACTO
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_PARENTESCO_CONTACTO
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_DOMICILIO
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_FORMACION_ACADEMICA
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_EXPERIENCIA_LABORAL
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_COMPETENCIA
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_IDIOMAS
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_FAMILIAR
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_FAMILIAR_UEES
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_HIJOS
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_REFERENCIA_LABORAL
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_REFERENCIA_PERSONAL
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_EMPRESA_PERSONA
                WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_NATURAL
                WHERE CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_JURIDICA
                WHERE CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA_USUARIO
                WHERE CORR_PERSONA = @CORR_PERSONA;
                DELETE FROM dbo.GEN_PERSONA
                WHERE CORR_PERSONA = @CORR_PERSONA;
            END

            COMMIT TRAN;";

			await using var conn = new SqlConnection(_connectionString);
			await conn.OpenAsync();
			await using var cmd = new SqlCommand(sql, conn);
			cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = corrEmpresa });
			cmd.Parameters.Add(new SqlParameter("@CORR_EMPLEADO", SqlDbType.Int) { Value = corrEmpleado });
			await cmd.ExecuteNonQueryAsync();
		}

		private static List<CParameter> BuildEmpleadoSpParams(
			GEN_EMPLEADO_MTTOTable Data,
			int tipoActualiza,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = tipoActualiza, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
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
				new CParameter() { ParameterName = "@CODIGO_EMPLEADO", Value = Data.CODIGO_EMPLEADO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@CORR_SEGURO_SOCIAL", Value = Data.CORR_SEGURO_SOCIAL, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@ESTADO_NIP", Value = Data.ESTADO_NIP, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@CORR_AFP", Value = Data.CORR_AFP, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@FECHA_AFILIACION_AFP", Value = Data.FECHA_AFILIACION_AFP, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "@FECHA_INCORPORACION_SP", Value = Data.FECHA_INCORPORACION_SP, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "@FECHA_INGRESO", Value = Data.FECHA_INGRESO, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "@CORREO_INSTITUCIONAL", Value = Data.CORREO_INSTITUCIONAL, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@TELEFONO_INSTITUCIONAL", Value = Data.TELEFONO_INSTITUCIONAL, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@ACTIVO_EMPLEADO", Value = Data.ACTIVO_EMPLEADO ?? true, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
			};
		}

		// Qué hace: invierte ACTIVO_EMPLEADO del empleado seleccionado.
		// Cómo: PRAL_MTTO_CATALOGO_ESTADO_BIT y relee la fila desde V_GEN_EMPLEADO.
		public async Task<CResult> ActivarInactivarAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
					};

					var readerGet = await objData.GetDataReader(_ViewName, xWhere);
					var response = new List<GEN_EMPLEADOView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_EMPLEADO ?? Data.CORR_EMPLEADO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
					objResultado.ErrorSource = string.Empty;
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_EMPLEADO;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
				}
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource = e.Source;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
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
