using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	/// <summary>
	/// Acceso a datos de SC_MOVIMIENTO_PERSONAL / V_SC_MOVIMIENTO_PERSONAL.
	/// Lookups viven aquí para no modificar otros controladores.
	/// </summary>
	public class SC_MOVIMIENTO_PERSONALRepository
		: BaseRepository<SC_MOVIMIENTO_PERSONALTable>, ISC_MOVIMIENTO_PERSONALRepository
	{
		private const string _TableName = "SC_MOVIMIENTO_PERSONAL";
		private const string _SpUnidadesUsuario = "PRAL_DATA_SC_UNIDADES_USUARIO";

		public SC_MOVIMIENTO_PERSONALRepository(IConfiguration config)
			: base(
				config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		private static object ToSqlDate(DateTime? fecha)
		{
			if (!fecha.HasValue || fecha.Value.Year < 1753)
			{
				return DBNull.Value;
			}

			return fecha.Value.Date;
		}

		private static object ToSqlDateTime(DateTime? fecha)
		{
			if (!fecha.HasValue || fecha.Value.Year < 1753)
			{
				return DBNull.Value;
			}

			return fecha.Value;
		}

		private static object ToDbInt(int? value)
		{
			return value.HasValue && value.Value > 0 ? value.Value : (object)DBNull.Value;
		}

		private static object ToDbDecimal(decimal? value)
		{
			return value.HasValue ? value.Value : (object)DBNull.Value;
		}

		private static object ToDbString(string value)
		{
			return string.IsNullOrWhiteSpace(value) ? (object)DBNull.Value : value.Trim();
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>()
					.FromDataReader(reader)
					.OrderByDescending(x => x.CORR_MOVIMIENTO_PERSONAL)
					.ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> CreateAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var objResultado = new CResult();

			try
			{
				var p = BuildWriteParameters(Data, includeKeys: true, includeCreateAudit: true);
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, "CORR_MOVIMIENTO_PERSONAL", pWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>().FromDataReader(reader).FirstOrDefault();

				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_MOVIMIENTO_PERSONAL ?? 0;
				objResultado.ErrorCode = response == null ? -1 : 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> UpdateAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var objResultado = new CResult();

			try
			{
				var p = BuildWriteParameters(Data, includeKeys: false, includeCreateAudit: false);
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_MOVIMIENTO_PERSONAL", Value = Data.CORR_MOVIMIENTO_PERSONAL, DbType = DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = Data.CORR_MOVIMIENTO_PERSONAL;
				objResultado.ErrorCode = response == null ? -1 : 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> DeleteAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var objResultado = new CResult();

			try
			{
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_MOVIMIENTO_PERSONAL", Value = Data.CORR_MOVIMIENTO_PERSONAL, DbType = DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_MOVIMIENTO_PERSONAL;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>
		/// Ejecuta PRAL_MTTO_SC_MOVIMIENTO_PERSONAL_AUTORIZA y relee la vista.
		/// </summary>
		public async Task<CResult> AutorizaAsync(SC_MOVIMIENTO_PERSONAL_AUTORIZAParam Data, string vLOGIN_SISTEMA)
		{
			var objResultado = new CResult();
			const string spName = "PRAL_MTTO_SC_MOVIMIENTO_PERSONAL_AUTORIZA";

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new() { ParameterName = "@CORR_MOVIMIENTO_PERSONAL", Value = Data.CORR_MOVIMIENTO_PERSONAL, DbType = DbType.Int32 },
					new()
					{
						ParameterName = "@CORR_UNIDAD_DOCUMENTO",
						Value = Data.CORR_UNIDAD_DOCUMENTO.HasValue && Data.CORR_UNIDAD_DOCUMENTO.Value > 0
							? Data.CORR_UNIDAD_DOCUMENTO.Value
							: (object)DBNull.Value,
						DbType = DbType.Int32,
					},
					new() { ParameterName = "@OPERACION", Value = Data.OPERACION, DbType = DbType.Int32 },
					new()
					{
						ParameterName = "@CORR_ACCION",
						Value = Data.CORR_ACCION.HasValue && Data.CORR_ACCION.Value > 0
							? Data.CORR_ACCION.Value
							: (object)DBNull.Value,
						DbType = DbType.Int32,
					},
					new() { ParameterName = "@LOGIN_SISTEMA", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = DbType.String },
					new() { ParameterName = "@OBSERVACION", Value = Data.OBSERVACION ?? string.Empty, DbType = DbType.String },
					new() { ParameterName = "@CORR_ESTADO", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.Output },
					new() { ParameterName = "@MENSAJE_ERROR", Value = string.Empty, DbType = DbType.String, Direction = ParameterDirection.Output, Size = 500 },
					new() { ParameterName = "@CORR_ACCION_USADA", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.Output },
					new() { ParameterName = "@CORR_PASO_ACTUAL", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.Output },
					new() { ParameterName = "@MODO", Value = string.Empty, DbType = DbType.String, Direction = ParameterDirection.Output, Size = 20 },
					new() { ParameterName = "@NOMBRE_ESTADO", Value = string.Empty, DbType = DbType.String, Direction = ParameterDirection.Output, Size = 100 },
					new() { ParameterName = "@ESTADO_MOVIMIENTO", Value = string.Empty, DbType = DbType.String, Direction = ParameterDirection.Output, Size = 2 },
				};

				await objData.ExecCmd(CommandType.StoredProcedure, spName, true, p);

				var mensajeError = objData.objCommand.Parameters["@MENSAJE_ERROR"].Value?.ToString();
				if (!string.IsNullOrWhiteSpace(mensajeError))
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_MOVIMIENTO_PERSONAL;
					objResultado.ErrorCode = -10;
					objResultado.ErrorMessage = mensajeError;
					objResultado.ErrorSource = "SC_MOVIMIENTO_PERSONAL.Autoriza";
					return objResultado;
				}

				var keyWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_MOVIMIENTO_PERSONAL", Value = Data.CORR_MOVIMIENTO_PERSONAL, DbType = DbType.Int32 },
				};

				var readerGet = await objData.GetDataReader("V_" + _TableName, keyWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>().FromDataReader(readerGet).FirstOrDefault();
				readerGet.Close();

				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = Data.CORR_MOVIMIENTO_PERSONAL;
				objResultado.ErrorCode = response == null ? -1 : 0;
				objResultado.ErrorMessage = response == null
					? "La operación de flujo se ejecutó pero no se pudo releer el movimiento."
					: string.Empty;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>
		/// Marca CONFIRMADO=1 y guarda auditoría de confirmación; relee la vista.
		/// </summary>
		public async Task<CResult> ConfirmarAsync(
			SC_MOVIMIENTO_PERSONALTable Data,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			var objResultado = new CResult();

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CONFIRMADO", Value = true, DbType = DbType.Boolean },
					new()
					{
						ParameterName = "USUARIO_CONFIRMA",
						Value = Data.USUARIO_CONFIRMA ?? vLOGIN_SISTEMA ?? string.Empty,
						DbType = DbType.String,
					},
					new()
					{
						ParameterName = "FECHA_CONFIRMA",
						Value = ToSqlDateTime(Data.FECHA_CONFIRMA ?? DateTime.Now),
						DbType = DbType.DateTime,
					},
					new()
					{
						ParameterName = "USUARIO_ACTU",
						Value = Data.USUARIO_ACTU ?? vLOGIN_SISTEMA ?? string.Empty,
						DbType = DbType.String,
					},
					new()
					{
						ParameterName = "ESTACION_ACTU",
						Value = Data.ESTACION_ACTU ?? vESTACION ?? string.Empty,
						DbType = DbType.String,
					},
					new()
					{
						ParameterName = "FECHA_ACTU",
						Value = ToSqlDateTime(Data.FECHA_ACTU == default ? DateTime.Now : Data.FECHA_ACTU),
						DbType = DbType.DateTime,
					},
				};

				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new()
					{
						ParameterName = "CORR_MOVIMIENTO_PERSONAL",
						Value = Data.CORR_MOVIMIENTO_PERSONAL,
						DbType = DbType.Int32,
					},
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<SC_MOVIMIENTO_PERSONALView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = Data.CORR_MOVIMIENTO_PERSONAL;
				objResultado.ErrorCode = response == null ? -1 : 0;
				objResultado.ErrorMessage = response == null
					? "La confirmación se ejecutó pero no se pudo releer el movimiento."
					: string.Empty;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> GetAllAsyncBitacora(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT
	FB.CORR_EMPRESA,
	FB.CORR_DOCUMENTO AS CORR_MOVIMIENTO_PERSONAL,
	FB.LOGIN_SISTEMA,
	FB.ESTADO_DESTINO,
	FB.COMENTARIO,
	FB.FECHA_ACCION
FROM V_SEG_FLUJO_BITACORA_FIRMAS FB
WHERE FB.CORR_TIPO_DOCUMENTO = @CORR_TIPO_DOCUMENTO
  AND FB.CORR_DOCUMENTO = @CORR_DOCUMENTO
ORDER BY FB.CORR_BITACORA", xWhere);

				var response = new List<SC_MOVIMIENTO_PERSONAL_BITACORAView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>Unidades efectivas del usuario (puesto + jefe + configuradas).</summary>
		public async Task<CResult> GetUnidadesUsuarioAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(CommandType.StoredProcedure, _SpUnidadesUsuario, xWhere);
				var response = new List<SC_MOVIMIENTO_LOOKUP_UNIDADView>()
					.FromDataReader(reader)
					.OrderBy(x => x.NOMBRE_UNIDAD)
					.ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>Puestos activos de una unidad (V_GEN_UNIDADES_PUESTO).</summary>
		public async Task<CResult> GetPuestosByUnidadAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT
	CORR_EMPRESA,
	CORR_UNIDAD,
	CORR_PUESTO,
	CAST(NOMBRE_PUESTO AS NVARCHAR(200)) AS NOMBRE_PUESTO
FROM dbo.V_GEN_UNIDADES_PUESTO
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_UNIDAD = @CORR_UNIDAD
ORDER BY NOMBRE_PUESTO", xWhere);

				var response = new List<SC_MOVIMIENTO_LOOKUP_PUESTOView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		/// <summary>Modalidades activas de la empresa.</summary>
		public async Task<CResult> GetModalidadesAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();

			try
			{
				var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT
	CORR_EMPRESA,
	CORR_TIPO_MODALIDAD,
	MODALIDAD_NOMBRE
FROM dbo.SC_TIPO_MODALIDAD
WHERE CORR_EMPRESA = @CORR_EMPRESA
ORDER BY MODALIDAD_NOMBRE", xWhere);

				var response = new List<SC_MOVIMIENTO_LOOKUP_MODALIDADView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private List<CParameter> BuildWriteParameters(
			SC_MOVIMIENTO_PERSONALTable Data,
			bool includeKeys,
			bool includeCreateAudit)
		{
			var p = new List<CParameter>();

			if (includeKeys)
			{
				p.Add(new CParameter { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 });
				p.Add(new CParameter
				{
					ParameterName = "CORR_MOVIMIENTO_PERSONAL",
					Value = Data.CORR_MOVIMIENTO_PERSONAL,
					DbType = DbType.Int32,
					Direction = ParameterDirection.InputOutput,
				});
			}

			p.Add(new CParameter { ParameterName = "FECHA_ELABORACION", Value = ToSqlDate(Data.FECHA_ELABORACION), DbType = DbType.Date });
			p.Add(new CParameter { ParameterName = "ORIGEN_MOVIMIENTO", Value = Data.ORIGEN_MOVIMIENTO ?? "DIRECTO", DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "TIPO_MOVIMIENTO", Value = Data.TIPO_MOVIMIENTO ?? "PERMANENTE", DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "ESTADO_MOVIMIENTO", Value = Data.ESTADO_MOVIMIENTO ?? "DI", DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "NOMBRE_COMPLETO", Value = Data.NOMBRE_COMPLETO ?? string.Empty, DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "NUMERO_ID", Value = ToDbString(Data.NUMERO_ID), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "FECHA_INGRESO_PROPUESTA", Value = ToSqlDate(Data.FECHA_INGRESO_PROPUESTA), DbType = DbType.Date });
			p.Add(new CParameter { ParameterName = "FECHA_FINALIZACION", Value = ToSqlDate(Data.FECHA_FINALIZACION), DbType = DbType.Date });
			p.Add(new CParameter { ParameterName = "GERENCIA_ACTUAL", Value = ToDbString(Data.GERENCIA_ACTUAL), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "CORR_UNIDAD_ACTUAL", Value = ToDbInt(Data.CORR_UNIDAD_ACTUAL), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "CORR_PUESTO_ACTUAL", Value = ToDbInt(Data.CORR_PUESTO_ACTUAL), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "SALARIO_ACTUAL", Value = ToDbDecimal(Data.SALARIO_ACTUAL), DbType = DbType.Decimal });
			p.Add(new CParameter { ParameterName = "CORR_TIPO_MODALIDAD_ACTUAL", Value = ToDbInt(Data.CORR_TIPO_MODALIDAD_ACTUAL), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "HORARIO_ACTUAL", Value = ToDbString(Data.HORARIO_ACTUAL), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "GERENCIA_PROPUESTA", Value = ToDbString(Data.GERENCIA_PROPUESTA), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "CORR_UNIDAD_PROPUESTA", Value = ToDbInt(Data.CORR_UNIDAD_PROPUESTA), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "CORR_PUESTO_PROPUESTO", Value = ToDbInt(Data.CORR_PUESTO_PROPUESTO), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "SALARIO_PROPUESTO", Value = ToDbDecimal(Data.SALARIO_PROPUESTO), DbType = DbType.Decimal });
			p.Add(new CParameter { ParameterName = "CORR_TIPO_MODALIDAD_PROPUESTA", Value = ToDbInt(Data.CORR_TIPO_MODALIDAD_PROPUESTA), DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "HORARIO_PROPUESTO", Value = ToDbString(Data.HORARIO_PROPUESTO), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "JUSTIFICACION", Value = ToDbString(Data.JUSTIFICACION), DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "FECHA_EFECTIVA", Value = ToSqlDate(Data.FECHA_EFECTIVA), DbType = DbType.Date });

			/* Confirmación solo se escribe en alta (default 0); Put Confirmar la actualiza aparte. */
			if (includeCreateAudit)
			{
				p.Add(new CParameter { ParameterName = "CONFIRMADO", Value = false, DbType = DbType.Boolean });
				p.Add(new CParameter { ParameterName = "USUARIO_CONFIRMA", Value = DBNull.Value, DbType = DbType.String });
				p.Add(new CParameter { ParameterName = "FECHA_CONFIRMA", Value = DBNull.Value, DbType = DbType.DateTime });
				p.Add(new CParameter { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = DbType.String });
				p.Add(new CParameter { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = DbType.String });
				p.Add(new CParameter { ParameterName = "FECHA_CREA", Value = ToSqlDateTime(Data.FECHA_CREA), DbType = DbType.DateTime });
			}

			p.Add(new CParameter { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "FECHA_ACTU", Value = ToSqlDateTime(Data.FECHA_ACTU), DbType = DbType.DateTime });

			return p;
		}

		private static void SetError(CResult objResultado, Exception e)
		{
			objResultado.Data = null;
			objResultado.Result = false;
			objResultado.CodeHelper = 0;
			objResultado.ErrorCode = -1;
			objResultado.ErrorMessage = e.Message;
			objResultado.ErrorSource += $"[{e.Source}]";
		}
	}
}
