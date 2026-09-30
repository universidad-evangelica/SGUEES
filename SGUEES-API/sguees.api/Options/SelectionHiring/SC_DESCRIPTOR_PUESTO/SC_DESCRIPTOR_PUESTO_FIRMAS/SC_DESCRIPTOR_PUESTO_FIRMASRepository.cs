// Qué hace: lee y guarda las firmas del descriptor de puesto.
// Cómo lo hace: al quedar Activo copia la última firma del jefe inmediato y la del jefe de TH desde la bitácora.
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public class SC_DESCRIPTOR_PUESTO_FIRMASRepository : ISC_DESCRIPTOR_PUESTO_FIRMASRepository
	{
		private const int TipoDocumentoDescriptor = 102;
		private const int ActorJefeInmediato = 3;
		private const int ActorJefeTh = 6;
		private const int PasoAprobacionJi = 8;
		private const int PasoAprobacionJth = 10;
		private const int EstadoAprobadoJi = 12;
		private const int EstadoActivo = 14;

		private readonly string _connectionString;

		public SC_DESCRIPTOR_PUESTO_FIRMASRepository(IConfiguration config)
		{
			_connectionString = config.GetConnectionString("defaultConnection") ?? string.Empty;
		}

		// Qué hace: lista las firmas ya guardadas de un descriptor.
		// Cómo lo hace: lee la tabla por empresa y descriptor, de la más antigua a la más nueva.
		public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_FIRMASParam xWhere)
		{
			CResult objResultado = new();
			try
			{
				const string sql = @"
SELECT
	CORR_EMPRESA,
	CORR_FIRMAS,
	CORR_DESCRIPTOR_PUESTO,
	NOMBRE_COMPLETO,
	TIPO_JEFE,
	TIPO_ACTOR,
	FECHA_FIRMA,
	USUARIO_CREA,
	ESTACION_CREA,
	FECHA_CREA,
	USUARIO_ACTU,
	ESTACION_ACTU,
	FECHA_ACTU
FROM dbo.SC_DESCRIPTOR_PUESTO_FIRMAS
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_DESCRIPTOR_PUESTO = @CORR_DESCRIPTOR_PUESTO
ORDER BY CORR_FIRMAS;";

				var rows = new List<SC_DESCRIPTOR_PUESTO_FIRMASView>();
				await using var conn = new SqlConnection(_connectionString);
				await conn.OpenAsync();
				await using var cmd = new SqlCommand(sql, conn);
				cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = xWhere.CORR_EMPRESA });
				cmd.Parameters.Add(new SqlParameter("@CORR_DESCRIPTOR_PUESTO", SqlDbType.Int) { Value = xWhere.CORR_DESCRIPTOR_PUESTO });
				await using var reader = await cmd.ExecuteReaderAsync();
				while (await reader.ReadAsync())
				{
					rows.Add(LeerFila(reader));
				}

				objResultado.Data = rows;
				objResultado.Result = true;
				objResultado.RowsAffected = rows.Count;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = string.Empty;
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

		// Qué hace: guarda las dos firmas que dejaron el descriptor Activo.
		// Cómo lo hace: lee la bitácora y inserta la última del paso 8 y la última del paso 10. No actualiza el flujo.
		public async Task GuardarAlQuedarActivoAsync(int corrEmpresa, int corrDescriptor, string login)
		{
			const string sql = @"
DECLARE @Siguiente INT;

SELECT @Siguiente = ISNULL(MAX(CORR_FIRMAS), 0)
FROM dbo.SC_DESCRIPTOR_PUESTO_FIRMAS WITH (UPDLOCK, HOLDLOCK)
WHERE CORR_EMPRESA = @CORR_EMPRESA;

INSERT INTO dbo.SC_DESCRIPTOR_PUESTO_FIRMAS (
	CORR_EMPRESA,
	CORR_FIRMAS,
	CORR_DESCRIPTOR_PUESTO,
	NOMBRE_COMPLETO,
	TIPO_JEFE,
	TIPO_ACTOR,
	FECHA_FIRMA,
	USUARIO_CREA,
	ESTACION_CREA,
	FECHA_CREA,
	USUARIO_ACTU,
	ESTACION_ACTU,
	FECHA_ACTU
)
SELECT
	@CORR_EMPRESA,
	@Siguiente + ROW_NUMBER() OVER (ORDER BY F.ORDEN),
	@CORR_DESCRIPTOR_PUESTO,
	LEFT(F.NOMBRE_COMPLETO, 100),
	LEFT(F.TIPO_JEFE, 50),
	LEFT(F.TIPO_ACTOR, 50),
	F.FECHA_FIRMA,
	LEFT(@LOGIN, 50),
	HOST_NAME(),
	GETDATE(),
	LEFT(@LOGIN, 50),
	HOST_NAME(),
	GETDATE()
FROM (
	SELECT
		CASE WHEN B.CORR_PASO = @PASO_JI THEN 1 ELSE 2 END AS ORDEN,
		COALESCE(
			NULLIF(LTRIM(RTRIM(PN.NOMBRE_COMPLETO)), ''),
			NULLIF(LTRIM(RTRIM(SU.NOMBRE_USUARIO)), ''),
			B.LOGIN_SISTEMA
		) AS NOMBRE_COMPLETO,
		CASE
			WHEN B.CORR_PASO = @PASO_JI THEN ISNULL(UP.NOMBRE_UNIDAD, UD.NOMBRE_UNIDAD)
			ELSE UJ.NOMBRE_UNIDAD
		END AS TIPO_JEFE,
		AC.NOMBRE_ACTOR AS TIPO_ACTOR,
		CAST(B.FECHA_CREA AS date) AS FECHA_FIRMA,
		ROW_NUMBER() OVER (
			PARTITION BY B.CORR_PASO
			ORDER BY B.CORR_BITACORA DESC
		) AS RN
	FROM dbo.SEG_FLUJO_INSTANCIA I
	INNER JOIN dbo.SEG_FLUJO_BITACORA B
		ON B.CORR_EMPRESA = I.CORR_EMPRESA
		AND B.CORR_INSTANCIA = I.CORR_INSTANCIA
	INNER JOIN dbo.SC_DESCRIPTOR_PUESTO D
		ON D.CORR_EMPRESA = I.CORR_EMPRESA
		AND D.CORR_DESCRIPTOR_PUESTO = I.CORR_DOCUMENTO
	LEFT JOIN dbo.SEG_FLUJO_ACTOR AC
		ON AC.CORR_EMPRESA = B.CORR_EMPRESA
		AND AC.CORR_ACTOR = B.TIPO_USUARIO
	LEFT JOIN dbo.SEG_USUARIO SU
		ON SU.LOGIN_SISTEMA = B.LOGIN_SISTEMA
	LEFT JOIN dbo.GEN_PERSONA_USUARIO PU
		ON PU.LOGIN_SISTEMA = B.LOGIN_SISTEMA
	LEFT JOIN dbo.GEN_PERSONA_NATURAL PN
		ON PN.CORR_PERSONA = PU.CORR_PERSONA
	LEFT JOIN dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES UD
		ON UD.CORR_EMPRESA = D.CORR_EMPRESA
		AND UD.CORR_UNIDAD = D.CORR_UNIDAD
	LEFT JOIN dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES UP
		ON UP.CORR_EMPRESA = D.CORR_EMPRESA
		AND UP.CORR_UNIDAD = dbo.SEG_FN_ObtenerUnidadPadre(D.CORR_UNIDAD)
	OUTER APPLY (
		SELECT TOP 1 A.CORR_UNIDAD
		FROM dbo.SEG_FLUJO_ACTOR_ASIGNACION A
		WHERE A.CORR_EMPRESA = B.CORR_EMPRESA
		  AND A.LOGIN_SISTEMA = B.LOGIN_SISTEMA
		  AND A.CORR_ACTOR = @ACTOR_JTH
		  AND A.ACTIVO = 1
		  AND A.CORR_UNIDAD IS NOT NULL
		ORDER BY A.CORR_ASIGNACION DESC
	) AJ
	LEFT JOIN dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES UJ
		ON UJ.CORR_EMPRESA = B.CORR_EMPRESA
		AND UJ.CORR_UNIDAD = AJ.CORR_UNIDAD
	WHERE I.CORR_EMPRESA = @CORR_EMPRESA
	  AND I.CORR_TIPO_DOCUMENTO = @TIPO_DOCUMENTO
	  AND I.CORR_DOCUMENTO = @CORR_DESCRIPTOR_PUESTO
	  AND I.ACTIVO = 1
	  AND (
			(B.CORR_PASO = @PASO_JI AND B.TIPO_USUARIO = @ACTOR_JI AND B.CORR_ESTADO_NUEVO = @ESTADO_JI)
			OR (B.CORR_PASO = @PASO_JTH AND B.TIPO_USUARIO = @ACTOR_JTH AND B.CORR_ESTADO_NUEVO = @ESTADO_ACTIVO)
	  )
) F
WHERE F.RN = 1;";

			await using var conn = new SqlConnection(_connectionString);
			await conn.OpenAsync();
			await using var tx = await conn.BeginTransactionAsync();
			await using var cmd = new SqlCommand(sql, conn, (SqlTransaction)tx);
			cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = corrEmpresa });
			cmd.Parameters.Add(new SqlParameter("@CORR_DESCRIPTOR_PUESTO", SqlDbType.Int) { Value = corrDescriptor });
			cmd.Parameters.Add(new SqlParameter("@LOGIN", SqlDbType.VarChar, 50) { Value = login ?? string.Empty });
			cmd.Parameters.Add(new SqlParameter("@TIPO_DOCUMENTO", SqlDbType.Int) { Value = TipoDocumentoDescriptor });
			cmd.Parameters.Add(new SqlParameter("@ACTOR_JI", SqlDbType.Int) { Value = ActorJefeInmediato });
			cmd.Parameters.Add(new SqlParameter("@ACTOR_JTH", SqlDbType.Int) { Value = ActorJefeTh });
			cmd.Parameters.Add(new SqlParameter("@PASO_JI", SqlDbType.Int) { Value = PasoAprobacionJi });
			cmd.Parameters.Add(new SqlParameter("@PASO_JTH", SqlDbType.Int) { Value = PasoAprobacionJth });
			cmd.Parameters.Add(new SqlParameter("@ESTADO_JI", SqlDbType.Int) { Value = EstadoAprobadoJi });
			cmd.Parameters.Add(new SqlParameter("@ESTADO_ACTIVO", SqlDbType.Int) { Value = EstadoActivo });
			await cmd.ExecuteNonQueryAsync();
			await tx.CommitAsync();
		}

		// Qué hace: arma una firma desde el lector.
		// Cómo lo hace: copia las columnas de texto y la fecha de alta.
		private static SC_DESCRIPTOR_PUESTO_FIRMASView LeerFila(SqlDataReader reader)
		{
			return new SC_DESCRIPTOR_PUESTO_FIRMASView
			{
				CORR_EMPRESA = reader["CORR_EMPRESA"] == DBNull.Value ? 0 : Convert.ToInt32(reader["CORR_EMPRESA"]),
				CORR_FIRMAS = reader["CORR_FIRMAS"] == DBNull.Value ? 0 : Convert.ToInt32(reader["CORR_FIRMAS"]),
				CORR_DESCRIPTOR_PUESTO = reader["CORR_DESCRIPTOR_PUESTO"] == DBNull.Value ? (int?)null : Convert.ToInt32(reader["CORR_DESCRIPTOR_PUESTO"]),
				NOMBRE_COMPLETO = reader["NOMBRE_COMPLETO"]?.ToString(),
				TIPO_JEFE = reader["TIPO_JEFE"]?.ToString(),
				TIPO_ACTOR = reader["TIPO_ACTOR"]?.ToString(),
				FECHA_FIRMA = reader["FECHA_FIRMA"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(reader["FECHA_FIRMA"]),
				USUARIO_CREA = reader["USUARIO_CREA"]?.ToString(),
				ESTACION_CREA = reader["ESTACION_CREA"]?.ToString(),
				FECHA_CREA = reader["FECHA_CREA"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(reader["FECHA_CREA"]),
				USUARIO_ACTU = reader["USUARIO_ACTU"]?.ToString(),
				ESTACION_ACTU = reader["ESTACION_ACTU"]?.ToString(),
				FECHA_ACTU = reader["FECHA_ACTU"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(reader["FECHA_ACTU"]),
			};
		}
	}
}
