using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_NOTIFICACIONRepository : BaseRepository<GEN_NOTIFICACIONTable>, IGEN_NOTIFICACIONRepository
	{
		private const string _ViewName = "V_GEN_NOTIFICACION";
		private const string _DefaultSortField = "FECHA_CREA";

		private static readonly string[] _AllowedSortFields =
		{
			"FECHA_CREA",
			"CORR_NOTIFICACION",
			"LEIDA",
			"TITULO"
		};

		private readonly string _connectionString;

		public GEN_NOTIFICACIONRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				 config.GetSection("DbProvider:defaultProvider").Value)
		{
			_connectionString = config.GetConnectionString("defaultConnection") ?? string.Empty;
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			var objResultado = new CResult();
			try
			{
				var paged = await ReadPagedViewAsync<GEN_NOTIFICACIONView>(
					_ViewName,
					xWhere,
					_AllowedSortFields,
					_DefaultSortField);

				objResultado.Data = paged.PageData;
				objResultado.Result = true;
				objResultado.RowsAffected = paged.TotalRows;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource = $"[GEN_NOTIFICACIONRepository.GetAllAsync][{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> CountPendientesAsync(int corrEmpresa, string loginSistema)
		{
			var objResultado = new CResult();
			const string sql = @"
SELECT COUNT(1) AS TOTAL
FROM dbo.V_GEN_NOTIFICACION
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND LOGIN_SISTEMA = @LOGIN_SISTEMA
  AND LEIDA = 0";

			try
			{
				await using var conn = new SqlConnection(_connectionString);
				await conn.OpenAsync();
				await using var cmd = new SqlCommand(sql, conn);
				cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = corrEmpresa });
				cmd.Parameters.Add(new SqlParameter("@LOGIN_SISTEMA", SqlDbType.VarChar, 30) { Value = loginSistema });

				var scalar = await cmd.ExecuteScalarAsync();
				var total = scalar == null || scalar == DBNull.Value ? 0 : Convert.ToInt32(scalar);

				objResultado.Data = total;
				objResultado.Result = true;
				objResultado.RowsAffected = total;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource = $"[GEN_NOTIFICACIONRepository.CountPendientesAsync][{e.Source}]";
			}

			return objResultado;
		}

		public async Task<CResult> MarcarLeidaAsync(
			int corrEmpresa,
			string loginSistema,
			int corrNotificacion,
			string usuarioActu,
			string estacionActu)
		{
			var objResultado = new CResult();
			const string sql = @"
UPDATE dbo.GEN_NOTIFICACION
SET
	LEIDA = 1,
	FECHA_LECTURA = CASE WHEN LEIDA = 0 THEN GETDATE() ELSE FECHA_LECTURA END,
	USUARIO_ACTU = @USUARIO_ACTU,
	ESTACION_ACTU = @ESTACION_ACTU,
	FECHA_ACTU = GETDATE()
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_NOTIFICACION = @CORR_NOTIFICACION
  AND LOGIN_SISTEMA = @LOGIN_SISTEMA;

SELECT
	CORR_EMPRESA,
	CORR_NOTIFICACION,
	LOGIN_SISTEMA,
	TITULO,
	MENSAJE,
	URL_DESTINO,
	FECHA_CREA,
	LEIDA,
	FECHA_LECTURA,
	USUARIO_CREA,
	ESTACION_CREA,
	USUARIO_ACTU,
	ESTACION_ACTU,
	FECHA_ACTU
FROM dbo.V_GEN_NOTIFICACION
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_NOTIFICACION = @CORR_NOTIFICACION
  AND LOGIN_SISTEMA = @LOGIN_SISTEMA;";

			try
			{
				await using var conn = new SqlConnection(_connectionString);
				await conn.OpenAsync();
				await using var cmd = new SqlCommand(sql, conn);
				cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = corrEmpresa });
				cmd.Parameters.Add(new SqlParameter("@CORR_NOTIFICACION", SqlDbType.Int) { Value = corrNotificacion });
				cmd.Parameters.Add(new SqlParameter("@LOGIN_SISTEMA", SqlDbType.VarChar, 30) { Value = loginSistema });
				cmd.Parameters.Add(new SqlParameter("@USUARIO_ACTU", SqlDbType.VarChar, 30) { Value = usuarioActu ?? string.Empty });
				cmd.Parameters.Add(new SqlParameter("@ESTACION_ACTU", SqlDbType.VarChar, 50) { Value = estacionActu ?? string.Empty });

				await using var reader = await cmd.ExecuteReaderAsync();
				if (!await reader.ReadAsync())
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 404;
					objResultado.ErrorMessage = "Notificación no encontrada para el usuario y empresa de la sesión.";
					objResultado.ErrorSource = "[GEN_NOTIFICACIONRepository.MarcarLeidaAsync]";
					return objResultado;
				}

				var view = MapView(reader);
				objResultado.Data = view;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource = $"[GEN_NOTIFICACIONRepository.MarcarLeidaAsync][{e.Source}]";
			}

			return objResultado;
		}

		public async Task<CResult> CrearAsync(GEN_NOTIFICACIONCreateParam data)
		{
			var objResultado = new CResult();
			const string sql = @"
DECLARE @CORR_NOTIFICACION INT;
DECLARE @FECHA DATETIME = GETDATE();

SELECT @CORR_NOTIFICACION = ISNULL(MAX(CORR_NOTIFICACION), 0) + 1
FROM dbo.GEN_NOTIFICACION WITH (UPDLOCK, HOLDLOCK)
WHERE CORR_EMPRESA = @CORR_EMPRESA;

INSERT INTO dbo.GEN_NOTIFICACION (
	CORR_EMPRESA,
	CORR_NOTIFICACION,
	LOGIN_SISTEMA,
	TITULO,
	MENSAJE,
	URL_DESTINO,
	FECHA_CREA,
	LEIDA,
	FECHA_LECTURA,
	USUARIO_CREA,
	ESTACION_CREA,
	USUARIO_ACTU,
	ESTACION_ACTU,
	FECHA_ACTU
)
VALUES (
	@CORR_EMPRESA,
	@CORR_NOTIFICACION,
	@LOGIN_SISTEMA,
	@TITULO,
	@MENSAJE,
	@URL_DESTINO,
	@FECHA,
	0,
	NULL,
	@USUARIO_CREA,
	@ESTACION_CREA,
	NULL,
	NULL,
	NULL
);

SELECT
	CORR_EMPRESA,
	CORR_NOTIFICACION,
	LOGIN_SISTEMA,
	TITULO,
	MENSAJE,
	URL_DESTINO,
	FECHA_CREA,
	LEIDA,
	FECHA_LECTURA,
	USUARIO_CREA,
	ESTACION_CREA,
	USUARIO_ACTU,
	ESTACION_ACTU,
	FECHA_ACTU
FROM dbo.V_GEN_NOTIFICACION
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_NOTIFICACION = @CORR_NOTIFICACION;";

			try
			{
				await using var conn = new SqlConnection(_connectionString);
				await conn.OpenAsync();
				await using var tx = (SqlTransaction)await conn.BeginTransactionAsync();
				await using var cmd = new SqlCommand(sql, conn, tx);

				cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = data.CORR_EMPRESA });
				cmd.Parameters.Add(new SqlParameter("@LOGIN_SISTEMA", SqlDbType.VarChar, 30) { Value = data.LOGIN_SISTEMA });
				cmd.Parameters.Add(new SqlParameter("@TITULO", SqlDbType.VarChar, 200) { Value = data.TITULO });
				cmd.Parameters.Add(new SqlParameter("@MENSAJE", SqlDbType.VarChar, 1000) { Value = data.MENSAJE });
				cmd.Parameters.Add(new SqlParameter("@URL_DESTINO", SqlDbType.NVarChar, 500)
				{
					Value = string.IsNullOrWhiteSpace(data.URL_DESTINO) ? DBNull.Value : data.URL_DESTINO.Trim()
				});
				cmd.Parameters.Add(new SqlParameter("@USUARIO_CREA", SqlDbType.VarChar, 30) { Value = data.USUARIO_CREA });
				cmd.Parameters.Add(new SqlParameter("@ESTACION_CREA", SqlDbType.VarChar, 50) { Value = data.ESTACION_CREA ?? string.Empty });

				await using var reader = await cmd.ExecuteReaderAsync();
				if (!await reader.ReadAsync())
				{
					await tx.RollbackAsync();
					objResultado.Result = false;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "No se pudo leer la notificación creada.";
					return objResultado;
				}

				var view = MapView(reader);
				await reader.CloseAsync();
				await tx.CommitAsync();

				objResultado.Data = view;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = view.CORR_NOTIFICACION;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource = $"[GEN_NOTIFICACIONRepository.CrearAsync][{e.Source}]";
			}

			return objResultado;
		}

		public async Task<bool> EsUsuarioThAsync(int corrEmpresa, string loginSistema)
		{
			if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(loginSistema))
			{
				return false;
			}

			// Cadena: LOGIN → persona → empleado → puesto vigente → organigrama.
			// TH = unidad con CODIGO 1010101 (Depto. Talento Humano) o hijas (CORR_UNIDAD_PADRE = TH).
			const string sql = @"
SELECT CAST(CASE WHEN EXISTS (
	SELECT 1
	FROM dbo.GEN_PERSONA_USUARIO AS PU
	INNER JOIN dbo.GEN_EMPLEADO AS E
		ON E.CORR_PERSONA = PU.CORR_PERSONA
	   AND E.CORR_EMPRESA = @CORR_EMPRESA
	CROSS APPLY (
		SELECT TOP (1) EP.CORR_UNIDAD
		FROM dbo.GEN_EMPLEADO_PUESTO AS EP
		WHERE EP.CORR_EMPRESA = E.CORR_EMPRESA
		  AND EP.CORR_EMPLEADO = E.CORR_EMPLEADO
		ORDER BY EP.FECHA_INGRESO DESC, EP.CORR_UNIDAD DESC
	) AS PUESTO
	INNER JOIN dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES AS U
		ON U.CORR_EMPRESA = @CORR_EMPRESA
	   AND U.CORR_UNIDAD = PUESTO.CORR_UNIDAD
	   AND U.ACTIVO = 1
	INNER JOIN dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES AS TH
		ON TH.CORR_EMPRESA = @CORR_EMPRESA
	   AND TH.ACTIVO = 1
	   AND (
			TH.CODIGO_UNIDAD = N'1010101'
			OR TH.NOMBRE_UNIDAD LIKE N'%Departamento de Talento Humano%'
	   )
	WHERE PU.LOGIN_SISTEMA = @LOGIN_SISTEMA
	  AND (U.CORR_UNIDAD = TH.CORR_UNIDAD OR U.CORR_UNIDAD_PADRE = TH.CORR_UNIDAD)
) THEN 1 ELSE 0 END AS bit);";

			try
			{
				await using var conn = new SqlConnection(_connectionString);
				await conn.OpenAsync();
				await using var cmd = new SqlCommand(sql, conn);
				cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = corrEmpresa });
				cmd.Parameters.Add(new SqlParameter("@LOGIN_SISTEMA", SqlDbType.VarChar, 30) { Value = loginSistema.Trim() });

				var scalar = await cmd.ExecuteScalarAsync();
				if (scalar == null || scalar == DBNull.Value)
				{
					return false;
				}

				return Convert.ToBoolean(scalar);
			}
			catch
			{
				return false;
			}
		}

		private static GEN_NOTIFICACIONView MapView(SqlDataReader reader)
		{
			return new GEN_NOTIFICACIONView
			{
				CORR_EMPRESA = Convert.ToInt32(reader["CORR_EMPRESA"]),
				CORR_NOTIFICACION = Convert.ToInt32(reader["CORR_NOTIFICACION"]),
				LOGIN_SISTEMA = reader["LOGIN_SISTEMA"]?.ToString(),
				TITULO = reader["TITULO"]?.ToString(),
				MENSAJE = reader["MENSAJE"]?.ToString(),
				URL_DESTINO = reader["URL_DESTINO"] == DBNull.Value ? null : reader["URL_DESTINO"]?.ToString(),
				FECHA_CREA = Convert.ToDateTime(reader["FECHA_CREA"]),
				LEIDA = Convert.ToBoolean(reader["LEIDA"]),
				FECHA_LECTURA = reader["FECHA_LECTURA"] == DBNull.Value ? null : Convert.ToDateTime(reader["FECHA_LECTURA"]),
				USUARIO_CREA = reader["USUARIO_CREA"]?.ToString(),
				ESTACION_CREA = reader["ESTACION_CREA"]?.ToString(),
				USUARIO_ACTU = reader["USUARIO_ACTU"] == DBNull.Value ? null : reader["USUARIO_ACTU"]?.ToString(),
				ESTACION_ACTU = reader["ESTACION_ACTU"] == DBNull.Value ? null : reader["ESTACION_ACTU"]?.ToString(),
				FECHA_ACTU = reader["FECHA_ACTU"] == DBNull.Value ? null : Convert.ToDateTime(reader["FECHA_ACTU"]),
			};
		}
	}
}
