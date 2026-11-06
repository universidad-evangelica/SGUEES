using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_PROVEEDORRepository : BaseRepository<GEN_PROVEEDORTable>, IGEN_PROVEEDORRepository
	{
		private const string _TableName = "GEN_PROVEEDOR";
		private const string _ViewName = "V_GEN_PROVEEDOR";
		private const string _SpMtto = "PRAL_MTTO_GEN_PROVEEDOR";
		private const string _DefaultSortField = "CORR_PROVEEDOR";

		private static readonly string[] _AllowedSortFields =
		{
			"CORR_PROVEEDOR",
			"CODIGO_PROVEEDOR",
			"NOMBRE_COMERCIAL",
			"NOMBRE_PROVEEDOR",
			"NOMBRE_TIPO_PERSONERIA",
			"ACTIVO_PROVEEDOR",
			"NOMBRE_ESTADO_PROVEEDOR",
			"USUARIO_CREA",
			"FECHA_CREA",
			"USUARIO_ACTU",
			"FECHA_ACTU",
		};

		public GEN_PROVEEDORRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var paged = await ReadPagedViewAsync<GEN_PROVEEDORView>(
					_ViewName,
					xWhere,
					_AllowedSortFields,
					_DefaultSortField);

				objResultado.Data = paged.PageData;
				objResultado.Result = true;
				objResultado.RowsAffected = paged.TotalRows;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = string.Empty;
				objResultado.ErrorSource = string.Empty;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
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
				var response = new List<GEN_PROVEEDORView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
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
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> GetPersonasLookupAsync(int corrEmpresa, long? corrPersonaIncluir)
		{
			CResult objResultado = new();
			try
			{
				var sql = @"
SELECT L.CORR_PERSONA, L.CODIGO_PERSONA, L.TIPO_PERSONERIA, L.NOMBRE_TIPO_PERSONERIA, L.NOMBRE_PERSONA, L.ACTIVO_PERSONA
FROM dbo.V_GEN_PERSONA_LOOKUP L
WHERE L.ACTIVO_PERSONA = 1
  AND (
		NOT EXISTS (
			SELECT 1 FROM dbo.GEN_PERSONA_PROVEEDOR VP
			WHERE VP.CORR_EMPRESA = @CORR_EMPRESA
			  AND VP.CORR_PERSONA = L.CORR_PERSONA
		)
		OR (@CORR_PERSONA_INCLUIR > 0 AND L.CORR_PERSONA = @CORR_PERSONA_INCLUIR)
	  )
ORDER BY L.NOMBRE_PERSONA";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PERSONA_INCLUIR", Value = corrPersonaIncluir ?? 0L, DbType = System.Data.DbType.Int64 },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				var response = new List<GEN_PERSONA_LOOKUPView>().FromDataReader(reader).ToList();
				reader.Close();

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
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> GetPersonaAsync(int corrEmpresa, long corrPersona)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
				};
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_GEN_PROVEEDOR_PERSONA", p);
				var response = new List<GEN_PROVEEDOR_PERSONAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response != null ? 1 : 0;
				objResultado.ErrorCode = 0;
				if (response == null)
				{
					objResultado.ErrorMessage = "Persona no encontrada.";
					objResultado.Result = false;
					objResultado.ErrorCode = 30000;
				}
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
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

		public Task<CResult> CreatePersonaNaturalAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecPersonaNaturalMttoAsync(UpdateType.Add, Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdatePersonaNaturalAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecPersonaNaturalMttoAsync(UpdateType.Update, Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> CreatePersonaJuridicaAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecPersonaJuridicaMttoAsync(UpdateType.Add, Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdatePersonaJuridicaAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecPersonaJuridicaMttoAsync(UpdateType.Update, Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> CreateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await ExecMttoAsync(UpdateType.Add, Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await ExecMttoAsync(UpdateType.Update, Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await ExecMttoAsync(UpdateType.Delete, Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarInactivarAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var sql = @"
UPDATE dbo.GEN_PROVEEDOR
SET ESTADO_PROVEEDOR = CASE WHEN ESTADO_PROVEEDOR = N'A' THEN N'I' ELSE N'A' END,
	USUARIO_ACTU = @USUARIO_ACTU,
	FECHA_ACTU = GETDATE(),
	ESTACION_ACTU = @ESTACION_ACTU
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_PROVEEDOR = @CORR_PROVEEDOR;";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@USUARIO_ACTU", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
				};

				await objData.ExecCmd(System.Data.CommandType.Text, sql, false, p);

				var xWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				};
				var readerGet = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_PROVEEDORView>().FromDataReader(readerGet).FirstOrDefault();
				readerGet.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_PROVEEDOR ?? Data.CORR_PROVEEDOR;
				objResultado.ErrorCode = 0;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
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

		private async Task<CResult> ExecMttoAsync(UpdateType tipo, GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = BuildMttoParameters(tipo, Data, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, _SpMtto, true, p);

				Data.CORR_PROVEEDOR = System.Convert.ToInt32(objData.objCommand.Parameters["@CORR_PROVEEDOR"].Value);
				var errorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMsg = objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value?.ToString() ?? string.Empty;

				if (errorCode == 0)
				{
					if (tipo == UpdateType.Delete)
					{
						objResultado.Data = null;
						objResultado.Result = true;
						objResultado.RowsAffected = 1;
						objResultado.CodeHelper = Data.CORR_PROVEEDOR;
						objResultado.ErrorCode = 0;
						return objResultado;
					}

					var xWhere = new List<CParameter>
					{
						new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
					};
					var readerGet = await objData.GetDataReader(_ViewName, xWhere);
					var response = new List<GEN_PROVEEDORView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_PROVEEDOR ?? Data.CORR_PROVEEDOR;
					objResultado.ErrorCode = 0;
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMsg;
					objResultado.CodeHelper = Data.CORR_PROVEEDOR;
				}
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
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

		private static List<CParameter> BuildMttoParameters(UpdateType tipo, GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			// DELETE solo manda PK por query; fechas default (0001-01-01) provocan SqlDateTime overflow.
			var fechaCrea = ToSqlDateTime(Data.FECHA_CREA);
			var fechaActu = ToSqlDateTime(Data.FECHA_ACTU);

			return new List<CParameter>
			{
				new() { ParameterName = "@TIPO_ACTUALIZA", Value = (int)tipo, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@CORR_PERSONA", Value = Data.CORR_PERSONA, DbType = System.Data.DbType.Int64 },
				new() { ParameterName = "@CODIGO_PROVEEDOR", Value = Data.CODIGO_PROVEEDOR ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@NOMBRE_COMERCIAL", Value = Data.NOMBRE_COMERCIAL ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@CORR_FORMA_PAGO", Value = Data.CORR_FORMA_PAGO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@ESTADO_PROVEEDOR", Value = Data.ESTADO_PROVEEDOR ?? "A", DbType = System.Data.DbType.String },
				new() { ParameterName = "@ESTADO_PROVEEDOR_WEB", Value = Data.ESTADO_PROVEEDOR_WEB ?? "D", DbType = System.Data.DbType.String },
				new() { ParameterName = "@CORR_CONDICION_PAGO", Value = Data.CORR_CONDICION_PAGO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@USUARIO_CREA", Value = Data.USUARIO_CREA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@FECHA_CREA", Value = fechaCrea, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "@ESTACION_CREA", Value = Data.ESTACION_CREA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@FECHA_ACTU", Value = fechaActu, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "@ESTACION_ACTU", Value = Data.ESTACION_ACTU ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
			};
		}

		private static System.DateTime ToSqlDateTime(System.DateTime value)
		{
			var minSql = new System.DateTime(1753, 1, 1);
			return value < minSql ? System.DateTime.Now : value;
		}

		private async Task<CResult> ExecPersonaNaturalMttoAsync(UpdateType tipo, GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@TIPO_ACTUALIZA", Value = (int)tipo, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PERSONA", Value = Data.CORR_PERSONA, DbType = System.Data.DbType.Int64, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@CORR_PERSONA_NATURAL", Value = Data.CORR_PERSONA_NATURAL ?? 0L, DbType = System.Data.DbType.Int64, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@CODIGO_PERSONA", Value = Data.CODIGO_PERSONA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@PRIMER_NOMBRE", Value = Data.PRIMER_NOMBRE ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SEGUNDO_NOMBRE", Value = Data.SEGUNDO_NOMBRE ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@PRIMER_APELLIDO", Value = Data.PRIMER_APELLIDO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SEGUNDO_APELLIDO", Value = Data.SEGUNDO_APELLIDO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@ES_EXTRANJERO", Value = Data.ES_EXTRANJERO ?? false, DbType = System.Data.DbType.Boolean },
					new() { ParameterName = "@DOMICILIADO", Value = Data.DOMICILIADO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@CORR_TIPO_CONTRIBUYENTE", Value = Data.CORR_TIPO_CONTRIBUYENTE ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_ACTIVIDAD_ECONOMICA", Value = Data.CORR_ACTIVIDAD_ECONOMICA ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@NUMERO_DIP", Value = Data.NUMERO_DIP ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@NUMERO_NIT", Value = Data.NUMERO_NIT ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@NUMERO_NRC", Value = Data.NUMERO_NRC ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@DIRECCION", Value = Data.DIRECCION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@CORR_PAIS", Value = Data.CORR_PAIS ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_DEPTO", Value = Data.CORR_DEPTO ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_MUNICIPIO", Value = Data.CORR_MUNICIPIO ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_DISTRITO", Value = Data.CORR_DISTRITO ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@TELEFONO_FIJO", Value = Data.TELEFONO_FIJO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@TELEFONO_MOVIL", Value = Data.TELEFONO_MOVIL ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@CORREO_ELECTRONICO_1", Value = Data.CORREO_ELECTRONICO_1 ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@CORREO_ELECTRONICO_2", Value = Data.CORREO_ELECTRONICO_2 ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_GEN_PROVEEDOR_PERSONA_NATURAL", true, p);

				Data.CORR_PERSONA = System.Convert.ToInt64(objData.objCommand.Parameters["@CORR_PERSONA"].Value);
				Data.CORR_PERSONA_NATURAL = System.Convert.ToInt64(objData.objCommand.Parameters["@CORR_PERSONA_NATURAL"].Value);
				var errorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMsg = objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value?.ToString() ?? string.Empty;

				if (errorCode != 0)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMsg;
					return objResultado;
				}

				return await GetPersonaAsync(Data.CORR_EMPRESA, Data.CORR_PERSONA);
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				return objResultado;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		private async Task<CResult> ExecPersonaJuridicaMttoAsync(UpdateType tipo, GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@TIPO_ACTUALIZA", Value = (int)tipo, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PERSONA", Value = Data.CORR_PERSONA, DbType = System.Data.DbType.Int64, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@CORR_PERSONA_JURIDICA", Value = Data.CORR_PERSONA_JURIDICA ?? 0L, DbType = System.Data.DbType.Int64, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@CODIGO_PERSONA", Value = Data.CODIGO_PERSONA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@NOMBRE_EMPRESA", Value = Data.NOMBRE_EMPRESA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@RAZON_SOCIAL", Value = Data.RAZON_SOCIAL ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@GIRO", Value = Data.GIRO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@ES_EXTRANJERO", Value = Data.ES_EXTRANJERO ?? false, DbType = System.Data.DbType.Boolean },
					new() { ParameterName = "@DOMICILIADO", Value = Data.DOMICILIADO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@CORR_TIPO_CONTRIBUYENTE", Value = Data.CORR_TIPO_CONTRIBUYENTE ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_ACTIVIDAD_ECONOMICA", Value = Data.CORR_ACTIVIDAD_ECONOMICA ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@NUMERO_NIT", Value = Data.NUMERO_NIT ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@NUMERO_NRC", Value = Data.NUMERO_NRC ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@DIRECCION", Value = Data.DIRECCION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@CORR_PAIS", Value = Data.CORR_PAIS ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_DEPTO", Value = Data.CORR_DEPTO ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_MUNICIPIO", Value = Data.CORR_MUNICIPIO ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_DISTRITO", Value = Data.CORR_DISTRITO ?? 0, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@TELEFONO_FIJO", Value = Data.TELEFONO_FIJO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@TELEFONO_MOVIL", Value = Data.TELEFONO_MOVIL ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@CORREO_ELECTRONICO_1", Value = Data.CORREO_ELECTRONICO_1 ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@CORREO_ELECTRONICO_2", Value = Data.CORREO_ELECTRONICO_2 ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_GEN_PROVEEDOR_PERSONA_JURIDICA", true, p);

				Data.CORR_PERSONA = System.Convert.ToInt64(objData.objCommand.Parameters["@CORR_PERSONA"].Value);
				Data.CORR_PERSONA_JURIDICA = System.Convert.ToInt64(objData.objCommand.Parameters["@CORR_PERSONA_JURIDICA"].Value);
				var errorCode = System.Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
				var errorMsg = objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value?.ToString() ?? string.Empty;

				if (errorCode != 0)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.ErrorCode = errorCode;
					objResultado.ErrorMessage = errorMsg;
					return objResultado;
				}

				return await GetPersonaAsync(Data.CORR_EMPRESA, Data.CORR_PERSONA);
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				return objResultado;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}
	}
}
