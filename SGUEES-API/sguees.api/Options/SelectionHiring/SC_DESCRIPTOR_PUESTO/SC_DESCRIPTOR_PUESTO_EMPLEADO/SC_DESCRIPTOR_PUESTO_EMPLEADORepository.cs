// Qué hace: acceso a empleados cargados en un descriptor de puesto.
// Cómo lo hace: lee V_SC_DESCRIPTOR_PUESTO_EMPLEADO y solo inserta si GEN_EMPLEADO_PUESTO coincide con el puesto y la unidad del descriptor.
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public class SC_DESCRIPTOR_PUESTO_EMPLEADORepository
		: BaseRepository<SC_DESCRIPTOR_PUESTO_EMPLEADOTable>,
			ISC_DESCRIPTOR_PUESTO_EMPLEADORepository
	{
		private const string _TableName = "SC_DESCRIPTOR_PUESTO_EMPLEADO";
		private const string _ViewName = "V_SC_DESCRIPTOR_PUESTO_EMPLEADO";
		private readonly string _connectionString;

		public SC_DESCRIPTOR_PUESTO_EMPLEADORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
			_connectionString = config.GetConnectionString("defaultConnection") ?? string.Empty;
		}

		// Qué hace: lista los empleados ya cargados en el descriptor.
		// Cómo lo hace: lee la vista filtrada por empresa y descriptor.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<SC_DESCRIPTOR_PUESTO_EMPLEADOView>().FromDataReader(reader)
					.OrderBy(x => x.NOMBRE_EMPLEADO)
					.ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
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

		// Qué hace: lee un empleado cargado.
		// Cómo lo hace: consulta la vista por la llave recibida.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<SC_DESCRIPTOR_PUESTO_EMPLEADOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
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

		// Qué hace: lista empleados del puesto y la unidad de este descriptor.
		// Cómo lo hace: incluye también los ya cargados para que el modal los muestre con check.
		public async Task<CResult> GetDisponiblesAsync(int corrEmpresa, int corrDescriptor)
		{
			CResult objResultado = new();
			try
			{
				const string sql = @"
				SELECT
					E.CORR_EMPRESA,
					@CORR_DESCRIPTOR_PUESTO AS CORR_DESCRIPTOR_PUESTO,
					E.CORR_EMPLEADO,
					E.NOMBRE_EMPLEADO,
					E.DUI,
					E.FECHA_INGRESO,
					E.CORREO_INSTITUCIONAL,
					E.TELEFONO_INSTITUCIONAL,
					E.LOGIN_SISTEMA_WEB,
					E.ACTIVO_EMPLEADO
				FROM dbo.V_GEN_EMPLEADO E
				INNER JOIN dbo.GEN_EMPLEADO_PUESTO P
					ON P.CORR_EMPRESA = E.CORR_EMPRESA
					AND P.CORR_EMPLEADO = E.CORR_EMPLEADO
				INNER JOIN dbo.SC_DESCRIPTOR_PUESTO D
					ON D.CORR_EMPRESA = P.CORR_EMPRESA
					AND D.CORR_DESCRIPTOR_PUESTO = @CORR_DESCRIPTOR_PUESTO
					AND D.CORR_PUESTO = P.CORR_PUESTO
					AND D.CORR_UNIDAD = P.CORR_UNIDAD
				WHERE E.CORR_EMPRESA = @CORR_EMPRESA
				ORDER BY E.NOMBRE_EMPLEADO;";

				var rows = new List<SC_DESCRIPTOR_PUESTO_EMPLEADOView>();
				await using var conn = new SqlConnection(_connectionString);
				await conn.OpenAsync();
				await using var cmd = new SqlCommand(sql, conn);
				cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = corrEmpresa });
				cmd.Parameters.Add(new SqlParameter("@CORR_DESCRIPTOR_PUESTO", SqlDbType.Int) { Value = corrDescriptor });
				await using var reader = await cmd.ExecuteReaderAsync();
				while (await reader.ReadAsync())
				{
					rows.Add(LeerEmpleado(reader, corrDescriptor));
				}

				objResultado.Data = rows;
				objResultado.Result = true;
				objResultado.RowsAffected = rows.Count;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}

			return objResultado;
		}

		// Qué hace: carga un empleado en el descriptor.
		// Cómo lo hace: rechaza si no tiene el puesto y la unidad, o si ya está cargado; luego relee la vista.
		public async Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var bloqueo = await MensajeBloqueoAsync(Data.CORR_EMPRESA, Data.CORR_DESCRIPTOR_PUESTO, Data.CORR_EMPLEADO);
				if (bloqueo != null)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = bloqueo;
					objResultado.RowsAffected = 0;
					return objResultado;
				}

				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA ?? DateTime.Now, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU ?? DateTime.Now, DbType = System.Data.DbType.DateTime },
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, string.Empty, pWhere);
				reader?.Close();
				var fila = await LeerFilaAsync(Data.CORR_EMPRESA, Data.CORR_DESCRIPTOR_PUESTO, Data.CORR_EMPLEADO);

				objResultado.Data = fila;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
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

		// Qué hace: esta tabla no se actualiza; el empleado se carga o se quita.
		// Cómo lo hace: devuelve un resultado controlado sin escribir en la tabla.
		public Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return Task.FromResult(new CResult
			{
				Data = null,
				Result = false,
				RowsAffected = 0,
				ErrorCode = 4000,
				ErrorMessage = "La carga de empleados no se actualiza. Quite el empleado y vuelva a cargarlo.",
				ErrorSource = "[SC_DESCRIPTOR_PUESTO_EMPLEADORepository]",
			});
		}

		// Qué hace: quita el empleado del descriptor.
		// Cómo lo hace: borra la fila por la llave compuesta.
		public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var noActivo = await MensajeSiNoActivoAsync(Data.CORR_EMPRESA, Data.CORR_DESCRIPTOR_PUESTO);
				if (noActivo != null)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = noActivo;
					objResultado.ErrorSource = "[SC_DESCRIPTOR_PUESTO_EMPLEADORepository]";
					return objResultado;
				}

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
				};
				await objData.Delete(_TableName, pWhere);
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
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

		// Qué hace: impide cargar o quitar empleados si el descriptor no está Activo.
		// Cómo lo hace: lee CORR_ESTADO; Activo es el correlativo 14.
		private async Task<string> MensajeSiNoActivoAsync(int corrEmpresa, int corrDescriptor)
		{
			const string sql = @"
			SELECT ISNULL(CORR_ESTADO, 0)
			FROM dbo.SC_DESCRIPTOR_PUESTO
			WHERE CORR_EMPRESA = @CORR_EMPRESA
			AND CORR_DESCRIPTOR_PUESTO = @CORR_DESCRIPTOR_PUESTO;";

			await using var conn = new SqlConnection(_connectionString);
			await conn.OpenAsync();
			await using var cmd = new SqlCommand(sql, conn);
			cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = corrEmpresa });
			cmd.Parameters.Add(new SqlParameter("@CORR_DESCRIPTOR_PUESTO", SqlDbType.Int) { Value = corrDescriptor });
			var estado = await cmd.ExecuteScalarAsync();
			if (estado == null || estado == DBNull.Value || Convert.ToInt32(estado) != 14)
			{
				return "La carga de empleados solo esta disponible cuando el descriptor esta Activo.";
			}

			return null;
		}

		// Qué hace: indica por qué no se puede cargar el empleado.
		// Cómo lo hace: revisa puesto y unidad del descriptor contra GEN_EMPLEADO_PUESTO.
		private async Task<string> MensajeBloqueoAsync(int corrEmpresa, int corrDescriptor, int corrEmpleado)
		{
			const string sql = @"
			SELECT
				ISNULL(D.CORR_ESTADO, 0) AS CORR_ESTADO,
				CASE WHEN D.CORR_PUESTO IS NULL OR D.CORR_PUESTO <= 0 OR D.CORR_UNIDAD IS NULL OR D.CORR_UNIDAD <= 0 THEN 1 ELSE 0 END AS SIN_PUESTO,
				CASE WHEN EXISTS (
					SELECT 1
					FROM dbo.GEN_EMPLEADO_PUESTO P
					WHERE P.CORR_EMPRESA = D.CORR_EMPRESA
					AND P.CORR_EMPLEADO = @CORR_EMPLEADO
					AND P.CORR_PUESTO = D.CORR_PUESTO
					AND P.CORR_UNIDAD = D.CORR_UNIDAD
				) THEN 1 ELSE 0 END AS APLICA,
				CASE WHEN EXISTS (
					SELECT 1
					FROM dbo.SC_DESCRIPTOR_PUESTO_EMPLEADO X
					WHERE X.CORR_EMPRESA = D.CORR_EMPRESA
					AND X.CORR_DESCRIPTOR_PUESTO = D.CORR_DESCRIPTOR_PUESTO
					AND X.CORR_EMPLEADO = @CORR_EMPLEADO
				) THEN 1 ELSE 0 END AS YA_ESTA,
				ISNULL(E.NOMBRE_EMPLEADO, '') AS NOMBRE_EMPLEADO
			FROM dbo.SC_DESCRIPTOR_PUESTO D
			LEFT JOIN dbo.V_GEN_EMPLEADO E
				ON E.CORR_EMPRESA = D.CORR_EMPRESA
				AND E.CORR_EMPLEADO = @CORR_EMPLEADO
			WHERE D.CORR_EMPRESA = @CORR_EMPRESA
			AND D.CORR_DESCRIPTOR_PUESTO = @CORR_DESCRIPTOR_PUESTO;";

			await using var conn = new SqlConnection(_connectionString);
			await conn.OpenAsync();
			await using var cmd = new SqlCommand(sql, conn);
			cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = corrEmpresa });
			cmd.Parameters.Add(new SqlParameter("@CORR_DESCRIPTOR_PUESTO", SqlDbType.Int) { Value = corrDescriptor });
			cmd.Parameters.Add(new SqlParameter("@CORR_EMPLEADO", SqlDbType.Int) { Value = corrEmpleado });
			await using var reader = await cmd.ExecuteReaderAsync();
			if (!await reader.ReadAsync())
			{
				return "Debe guardar el descriptor antes de cargar empleados.";
			}

			var corrEstado = reader.GetInt32(0);
			var sinPuesto = reader.GetInt32(1) == 1;
			var aplica = reader.GetInt32(2) == 1;
			var yaEsta = reader.GetInt32(3) == 1;
			var nombre = reader.IsDBNull(4) ? "" : reader.GetString(4);
			var quien = string.IsNullOrWhiteSpace(nombre) ? "el empleado" : $"el empleado {nombre.Trim()}";

			if (corrEstado != 14)
			{
				return "La carga de empleados solo esta disponible cuando el descriptor esta Activo.";
			}

			if (sinPuesto)
			{
				return "El descriptor no tiene puesto y unidad. No se pueden cargar empleados.";
			}

			if (yaEsta)
			{
				return $"Ese empleado ya esta registrado en este descriptor.";
			}

			if (!aplica)
			{
				return $"No se puede cargar {quien} porque no tiene el puesto y la unidad de este descriptor.";
			}

			return null;
		}

		private async Task<SC_DESCRIPTOR_PUESTO_EMPLEADOView> LeerFilaAsync(int corrEmpresa, int corrDescriptor, int corrEmpleado)
		{
			var where = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = corrDescriptor, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
			};
			var reader = await objData.GetDataReader(_ViewName, where);
			var fila = new List<SC_DESCRIPTOR_PUESTO_EMPLEADOView>().FromDataReader(reader).FirstOrDefault();
			reader.Close();
			return fila;
		}

		private static SC_DESCRIPTOR_PUESTO_EMPLEADOView LeerEmpleado(SqlDataReader reader, int corrDescriptor)
		{
			return new SC_DESCRIPTOR_PUESTO_EMPLEADOView
			{
				CORR_EMPRESA = reader.GetInt32(0),
				CORR_DESCRIPTOR_PUESTO = corrDescriptor,
				CORR_EMPLEADO = reader.GetInt32(2),
				NOMBRE_EMPLEADO = reader.IsDBNull(3) ? "" : reader.GetString(3),
				DUI = reader.IsDBNull(4) ? "" : reader.GetString(4),
				FECHA_INGRESO = reader.IsDBNull(5) ? null : reader.GetDateTime(5),
				CORREO_INSTITUCIONAL = reader.IsDBNull(6) ? "" : reader.GetString(6),
				TELEFONO_INSTITUCIONAL = reader.IsDBNull(7) ? "" : reader.GetString(7),
				LOGIN_SISTEMA_WEB = reader.IsDBNull(8) ? "" : reader.GetString(8),
				ACTIVO_EMPLEADO = reader.IsDBNull(9) ? null : reader.GetBoolean(9),
			};
		}
	}
}
