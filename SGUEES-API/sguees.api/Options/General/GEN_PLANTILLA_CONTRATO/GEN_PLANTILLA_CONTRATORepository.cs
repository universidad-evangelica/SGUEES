// Qué hace: persistencia SQL del catálogo plantillas de contrato.
// Cómo lo hace: ejecuta GetAll, Get, Create, Update, Delete y verificación de duplicados sobre GEN_PLANTILLA_CONTRATO y V_GEN_PLANTILLA_CONTRATO.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	// Qué hace: repositorio de acceso a datos para plantillas de contrato.
	// Cómo lo hace: utiliza BaseRepository y objData contra GEN_PLANTILLA_CONTRATO / V_GEN_PLANTILLA_CONTRATO.
	public class GEN_PLANTILLA_CONTRATORepository : BaseRepository<GEN_PLANTILLA_CONTRATOTable>, IGEN_PLANTILLA_CONTRATORepository
	{
		private const string _ViewName = "V_GEN_PLANTILLA_CONTRATO";
		private const string SqlAmbitoOrganigrama = @"
;WITH EmpleadoSesion AS
(
	SELECT E.CORR_EMPRESA, E.CORR_EMPLEADO
	FROM dbo.GEN_EMPLEADO E
	INNER JOIN dbo.GEN_PERSONA_USUARIO PU ON PU.CORR_PERSONA = E.CORR_PERSONA
	WHERE E.CORR_EMPRESA = @CORR_EMPRESA
	  AND LTRIM(RTRIM(PU.LOGIN_SISTEMA)) = @USUARIO_CREA
),
UnidadesComoJefe AS
(
	SELECT DISTINCT JU.CORR_EMPRESA, JU.CORR_UNIDAD
	FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES JU
	INNER JOIN EmpleadoSesion ES
		ON ES.CORR_EMPRESA = JU.CORR_EMPRESA
	   AND ES.CORR_EMPLEADO = JU.CORR_EMPLEADO
	WHERE JU.CORR_EMPRESA = @CORR_EMPRESA
	  AND JU.ACTIVO = CONVERT(BIT, 1)
),
UnidadesDescendientes AS
(
	SELECT U.CORR_EMPRESA, U.CORR_UNIDAD, 0 AS NIVEL
	FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES U
	INNER JOIN UnidadesComoJefe J
		ON J.CORR_EMPRESA = U.CORR_EMPRESA
	   AND J.CORR_UNIDAD = U.CORR_UNIDAD_PADRE
	WHERE U.CORR_EMPRESA = @CORR_EMPRESA

	UNION ALL

	SELECT U.CORR_EMPRESA, U.CORR_UNIDAD, D.NIVEL + 1
	FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES U
	INNER JOIN UnidadesDescendientes D
		ON D.CORR_EMPRESA = U.CORR_EMPRESA
	   AND D.CORR_UNIDAD = U.CORR_UNIDAD_PADRE
	WHERE U.CORR_EMPRESA = @CORR_EMPRESA
	  AND D.NIVEL < 20
),
UnidadesVisibles AS
(
	SELECT CORR_EMPRESA, CORR_UNIDAD FROM UnidadesComoJefe
	UNION
	SELECT CORR_EMPRESA, CORR_UNIDAD FROM UnidadesDescendientes
)
";
		private const string SqlPlantillaEnAmbito = @"
(
	LTRIM(RTRIM(ISNULL(PC.USUARIO_CREA, ''))) = @USUARIO_CREA
	OR EXISTS (
		SELECT 1
		FROM dbo.GEN_PERSONA_USUARIO PU
		INNER JOIN dbo.GEN_EMPLEADO E
			ON E.CORR_PERSONA = PU.CORR_PERSONA
		   AND E.CORR_EMPRESA = PC.CORR_EMPRESA
		INNER JOIN dbo.GEN_EMPLEADO_PUESTO EP
			ON EP.CORR_EMPRESA = E.CORR_EMPRESA
		   AND EP.CORR_EMPLEADO = E.CORR_EMPLEADO
		INNER JOIN UnidadesVisibles UV
			ON UV.CORR_EMPRESA = EP.CORR_EMPRESA
		   AND UV.CORR_UNIDAD = EP.CORR_UNIDAD
		WHERE LTRIM(RTRIM(PU.LOGIN_SISTEMA)) = LTRIM(RTRIM(ISNULL(PC.USUARIO_CREA, '')))
	)
)";

		public GEN_PLANTILLA_CONTRATORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<bool> PuedeAdministrarAsync(int corrEmpresa, int corrPlantilla, string login)
		{
			if (corrEmpresa <= 0 || corrPlantilla <= 0 || string.IsNullOrWhiteSpace(login))
			{
				return false;
			}

			string sql = SqlAmbitoOrganigrama + @"
SELECT CASE WHEN EXISTS
(
	SELECT 1
	FROM dbo.GEN_PLANTILLA_CONTRATO PC
	WHERE PC.CORR_EMPRESA = @CORR_EMPRESA
	  AND PC.CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
	  AND " + SqlPlantillaEnAmbito + @"
) THEN 1 ELSE 0 END
OPTION (MAXRECURSION 20);";

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO", Value = corrPlantilla, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = login.Trim(), DbType = System.Data.DbType.String },
				});
				var allowed = reader.Read() && Convert.ToInt32(reader[0]) == 1;
				reader.Close();
				return allowed;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		// Qué hace: lista las plantillas visibles para el login: las propias y las de unidades bajo su jefatura.
		// Cómo lo hace: consulta V_GEN_PLANTILLA_CONTRATO con el ámbito del organigrama y ordena por correlativo descendente.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			string sql = SqlAmbitoOrganigrama + @"
SELECT PC.*
FROM dbo.V_GEN_PLANTILLA_CONTRATO PC
WHERE PC.CORR_EMPRESA = @CORR_EMPRESA
  AND " + SqlPlantillaEnAmbito + @"
ORDER BY PC.CORR_PLANTILLA_CONTRATO DESC
OPTION (MAXRECURSION 20);";

			try
			{
				var dbWhere = xWhere
					.Where(x => x.ParameterName == "CORR_EMPRESA" || x.ParameterName == "USUARIO_CREA")
					.ToList();

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, dbWhere);
				var response = new List<GEN_PLANTILLA_CONTRATOView>().FromDataReader(reader)
					.OrderByDescending(x => x.CORR_PLANTILLA_CONTRATO)
					.ToList();

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
			catch (Exception e)
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

		// Qué hace: consulta una plantilla de contrato puntual solo si pertenece al ámbito del login.
		// Cómo lo hace: aplica la misma visibilidad de GetAll y devuelve el primer registro autorizado.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			string sql = SqlAmbitoOrganigrama + @"
SELECT PC.*
FROM dbo.V_GEN_PLANTILLA_CONTRATO PC
WHERE PC.CORR_EMPRESA = @CORR_EMPRESA
  AND PC.CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
  AND " + SqlPlantillaEnAmbito + @"
OPTION (MAXRECURSION 20);";

			try
			{
				var dbWhere = xWhere
					.Where(x => x.ParameterName == "CORR_EMPRESA"
						|| x.ParameterName == "CORR_PLANTILLA_CONTRATO"
						|| x.ParameterName == "USUARIO_CREA")
					.ToList();
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, dbWhere);
				var response = new List<GEN_PLANTILLA_CONTRATOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_PLANTILLA_CONTRATO ?? 0;
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
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: inserta el encabezado de una nueva plantilla en estado Borrador (sin versiones todavía).
		// Cómo lo hace: calcula el correlativo en GEN_PLANTILLA_CONTRATO dentro de una transacción y devuelve la fila desde V_GEN_PLANTILLA_CONTRATO.
		public async Task<CResult> CreateAsync(GEN_PLANTILLA_CONTRATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	DECLARE @CORR_PLANTILLA_CONTRATO INT;

	SELECT @CORR_PLANTILLA_CONTRATO = ISNULL(MAX(CORR_PLANTILLA_CONTRATO), 0) + 1
	FROM dbo.GEN_PLANTILLA_CONTRATO WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA;

	INSERT INTO dbo.GEN_PLANTILLA_CONTRATO
	(
		CORR_EMPRESA,
		CORR_PLANTILLA_CONTRATO,
		NOMBRE_PLANTILLA,
		CORR_TIPO_CONTRATACION,
		USUARIO_CREA,
		ESTACION_CREA,
		FECHA_CREA,
		USUARIO_ACTU,
		ESTACION_ACTU,
		FECHA_ACTU
	)
	VALUES
	(
		@CORR_EMPRESA,
		@CORR_PLANTILLA_CONTRATO,
		@NOMBRE_PLANTILLA,
		@CORR_TIPO_CONTRATACION,
		@USUARIO_CREA,
		@ESTACION_CREA,
		@FECHA_CREA,
		@USUARIO_ACTU,
		@ESTACION_ACTU,
		@FECHA_ACTU
	);

	DELETE FROM dbo.GEN_PLANTILLA_CONTRATO_BITACORA
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

	DECLARE @CORR_BITACORA INT;
	SELECT @CORR_BITACORA = ISNULL(MAX(CORR_BITACORA), 0) + 1
	FROM dbo.GEN_PLANTILLA_CONTRATO_BITACORA WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA;

	INSERT INTO dbo.GEN_PLANTILLA_CONTRATO_BITACORA
	(
		CORR_EMPRESA,
		CORR_BITACORA,
		CORR_PLANTILLA_CONTRATO,
		NOMBRE_PLANTILLA,
		CORR_PLANTILLA_CONTRATO_VERSION,
		NOMBRE_VERSION,
		TIPO_EVENTO,
		DETALLE,
		FECHA_ACCION,
		USUARIO_CREA,
		ESTACION_CREA,
		FECHA_CREA
	)
	VALUES
	(
		@CORR_EMPRESA,
		@CORR_BITACORA,
		@CORR_PLANTILLA_CONTRATO,
		@NOMBRE_PLANTILLA,
		NULL,
		NULL,
		'CREACION_BORRADOR',
		LEFT('Se creó la plantilla ""' + @NOMBRE_PLANTILLA + '"" en estado Borrador.', 1000),
		@FECHA_CREA,
		@USUARIO_CREA,
		@ESTACION_CREA,
		@FECHA_CREA
	);

	COMMIT TRAN;

	SELECT *
	FROM dbo.V_GEN_PLANTILLA_CONTRATO
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0
		ROLLBACK TRAN;
	THROW;
END CATCH;";

			try
			{
				var fechaCrea = Data.FECHA_CREA ?? DateTime.Now;
				var fechaActu = Data.FECHA_ACTU ?? fechaCrea;
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "NOMBRE_PLANTILLA", Value = Data.NOMBRE_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_TIPO_CONTRATACION", Value = Data.CORR_TIPO_CONTRATACION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = (object)(Data.USUARIO_CREA ?? vLOGIN_SISTEMA) ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = (object)(Data.ESTACION_CREA ?? vESTACION) ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = fechaCrea, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = (object)(Data.USUARIO_ACTU ?? vLOGIN_SISTEMA) ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = (object)(Data.ESTACION_ACTU ?? vESTACION) ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = fechaActu, DbType = System.Data.DbType.DateTime },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				var response = new List<GEN_PLANTILLA_CONTRATOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_PLANTILLA_CONTRATO ?? 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				SetSaveError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: actualiza el encabezado de la plantilla y guarda v1 en Borrador si aún no hay versiones y hay contenido.
		// Cómo lo hace: actualiza GEN_PLANTILLA_CONTRATO; inserta v1 inactiva (ES_VERSION_ACTIVA = 0) solo cuando no existen versiones previas.
		public async Task<CResult> UpdateAsync(GEN_PLANTILLA_CONTRATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	DECLARE @NOMBRE_ACTUAL VARCHAR(200);
	DECLARE @TIPO_ACTUAL INT;

	SELECT TOP 1
		@NOMBRE_ACTUAL = NOMBRE_PLANTILLA,
		@TIPO_ACTUAL = CORR_TIPO_CONTRATACION
	FROM dbo.GEN_PLANTILLA_CONTRATO WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

	UPDATE dbo.GEN_PLANTILLA_CONTRATO
	SET NOMBRE_PLANTILLA = @NOMBRE_PLANTILLA,
		CORR_TIPO_CONTRATACION = @CORR_TIPO_CONTRATACION,
		USUARIO_ACTU = @USUARIO_ACTU,
		ESTACION_ACTU = @ESTACION_ACTU,
		FECHA_ACTU = @FECHA_ACTU
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

	IF @@ROWCOUNT > 0
	BEGIN
		DECLARE @TIENE_VERSIONES BIT = 0;

		IF EXISTS (
			SELECT 1
			FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION WITH (UPDLOCK, HOLDLOCK)
			WHERE CORR_EMPRESA = @CORR_EMPRESA
			  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
		)
		BEGIN
			SET @TIENE_VERSIONES = 1;
		END

		IF @TIENE_VERSIONES = 0 AND @CUERPO_PLANTILLA IS NOT NULL
		BEGIN
			DECLARE @NUEVA_VERSION_CORR INT;
			DECLARE @CORR_BITACORA_V1 INT;

			SELECT @NUEVA_VERSION_CORR = ISNULL(MAX(CORR_PLANTILLA_CONTRATO_VERSION), 0) + 1
			FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION WITH (UPDLOCK, HOLDLOCK)
			WHERE CORR_EMPRESA = @CORR_EMPRESA;

			INSERT INTO dbo.GEN_PLANTILLA_CONTRATO_VERSION
			(
				CORR_EMPRESA,
				CORR_PLANTILLA_CONTRATO_VERSION,
				CORR_PLANTILLA_CONTRATO,
				NUMERO_VERSION,
				NOMBRE_VERSION,
				CORR_VERSION_PADRE,
				CUERPO_PLANTILLA,
				ES_VERSION_ACTIVA,
				OBSERVACION,
				USUARIO_CREA,
				ESTACION_CREA,
				FECHA_CREA,
				USUARIO_ACTU,
				ESTACION_ACTU,
				FECHA_ACTU
			)
			VALUES
			(
				@CORR_EMPRESA,
				@NUEVA_VERSION_CORR,
				@CORR_PLANTILLA_CONTRATO,
				1,
				'Versión 1',
				NULL,
				@CUERPO_PLANTILLA,
				0,
				'Versión inicial',
				@USUARIO_ACTU,
				@ESTACION_ACTU,
				@FECHA_ACTU,
				@USUARIO_ACTU,
				@ESTACION_ACTU,
				@FECHA_ACTU
			);

			SELECT @CORR_BITACORA_V1 = ISNULL(MAX(CORR_BITACORA), 0) + 1
			FROM dbo.GEN_PLANTILLA_CONTRATO_BITACORA WITH (UPDLOCK, HOLDLOCK)
			WHERE CORR_EMPRESA = @CORR_EMPRESA;

			INSERT INTO dbo.GEN_PLANTILLA_CONTRATO_BITACORA
			(
				CORR_EMPRESA,
				CORR_BITACORA,
				CORR_PLANTILLA_CONTRATO,
				NOMBRE_PLANTILLA,
				CORR_PLANTILLA_CONTRATO_VERSION,
				NOMBRE_VERSION,
				TIPO_EVENTO,
				DETALLE,
				FECHA_ACCION,
				USUARIO_CREA,
				ESTACION_CREA,
				FECHA_CREA
			)
			VALUES
			(
				@CORR_EMPRESA,
				@CORR_BITACORA_V1,
				@CORR_PLANTILLA_CONTRATO,
				@NOMBRE_PLANTILLA,
				@NUEVA_VERSION_CORR,
				'Versión 1',
				'CREACION_VERSION',
				LEFT('Se guardó la Versión 1 inicial en estado Borrador para ""' + @NOMBRE_PLANTILLA + '"".', 1000),
				@FECHA_ACTU,
				@USUARIO_ACTU,
				@ESTACION_ACTU,
				@FECHA_ACTU
			);
		END
		ELSE IF ISNULL(@NOMBRE_ACTUAL, '') <> ISNULL(@NOMBRE_PLANTILLA, '') OR ISNULL(@TIPO_ACTUAL, 0) <> ISNULL(@CORR_TIPO_CONTRATACION, 0)
		BEGIN
			DECLARE @CORR_BITACORA_ENC INT;

			SELECT @CORR_BITACORA_ENC = ISNULL(MAX(CORR_BITACORA), 0) + 1
			FROM dbo.GEN_PLANTILLA_CONTRATO_BITACORA WITH (UPDLOCK, HOLDLOCK)
			WHERE CORR_EMPRESA = @CORR_EMPRESA;

			INSERT INTO dbo.GEN_PLANTILLA_CONTRATO_BITACORA
			(
				CORR_EMPRESA,
				CORR_BITACORA,
				CORR_PLANTILLA_CONTRATO,
				NOMBRE_PLANTILLA,
				CORR_PLANTILLA_CONTRATO_VERSION,
				NOMBRE_VERSION,
				TIPO_EVENTO,
				DETALLE,
				FECHA_ACCION,
				USUARIO_CREA,
				ESTACION_CREA,
				FECHA_CREA
			)
			VALUES
			(
				@CORR_EMPRESA,
				@CORR_BITACORA_ENC,
				@CORR_PLANTILLA_CONTRATO,
				@NOMBRE_PLANTILLA,
				NULL,
				NULL,
				'ACTUALIZACION_ENCABEZADO',
				LEFT('Se actualizó el encabezado de la plantilla a ""' + @NOMBRE_PLANTILLA + '"".', 1000),
				@FECHA_ACTU,
				@USUARIO_ACTU,
				@ESTACION_ACTU,
				@FECHA_ACTU
			);
		END
	END

	COMMIT TRAN;

	SELECT *
	FROM dbo.V_GEN_PLANTILLA_CONTRATO
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0
		ROLLBACK TRAN;
	THROW;
END CATCH;";

			try
			{
				var fechaActu = Data.FECHA_ACTU ?? DateTime.Now;
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO", Value = Data.CORR_PLANTILLA_CONTRATO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "NOMBRE_PLANTILLA", Value = Data.NOMBRE_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_TIPO_CONTRATACION", Value = Data.CORR_TIPO_CONTRATACION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CUERPO_PLANTILLA", Value = (object)Data.CUERPO_PLANTILLA ?? DBNull.Value, DbType = System.Data.DbType.String, Size = -1 },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = (object)(Data.USUARIO_ACTU ?? vLOGIN_SISTEMA) ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = (object)(Data.ESTACION_ACTU ?? vESTACION) ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = fechaActu, DbType = System.Data.DbType.DateTime },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				var response = new List<GEN_PLANTILLA_CONTRATOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				if (response == null)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "No se encontró la plantilla de contrato a actualizar.";
					objResultado.ErrorSource = "[GEN_PLANTILLA_CONTRATORepository]";
				}
				else
				{
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_PLANTILLA_CONTRATO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
			}
			catch (Exception e)
			{
				SetSaveError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: elimina una plantilla de contrato únicamente si continúa en Borrador y no está asignada a empleados.
		// Cómo lo hace: bloquea si hay versión activa o contratos; borra versiones, encabezado y la bitácora de ese correlativo.
		public async Task<CResult> DeleteAsync(GEN_PLANTILLA_CONTRATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	IF EXISTS (
		SELECT 1
		FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION WITH (UPDLOCK, HOLDLOCK)
		WHERE CORR_EMPRESA = @CORR_EMPRESA
		  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
		  AND ES_VERSION_ACTIVA = 1
	)
	BEGIN
		ROLLBACK TRAN;
		SELECT -1 AS RESULTADO_DELETE;
	END
	ELSE IF OBJECT_ID('dbo.GEN_EMPLEADO_CONTRATO', 'U') IS NOT NULL
		AND EXISTS (
		SELECT 1
		FROM dbo.GEN_EMPLEADO_CONTRATO EC
		INNER JOIN dbo.GEN_EMPLEADO EM
			ON EM.CORR_EMPRESA = EC.CORR_EMPRESA
		   AND EM.CORR_EMPLEADO = EC.CORR_EMPLEADO
		INNER JOIN dbo.GEN_PLANTILLA_CONTRATO_VERSION PV
			ON PV.CORR_EMPRESA = EC.CORR_EMPRESA
		   AND PV.CORR_PLANTILLA_CONTRATO_VERSION = EC.CORR_PLANTILLA_CONTRATO_VERSION
		   AND PV.CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
		WHERE EC.CORR_EMPRESA = @CORR_EMPRESA
		  AND EC.CORR_EMPLEADO > 0
		  AND EC.ESTADO_CONTRATO IN (1, 2)
	)
	BEGIN
		ROLLBACK TRAN;
		SELECT -2 AS RESULTADO_DELETE;
	END
	ELSE
	BEGIN
		DELETE FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION
		WHERE CORR_EMPRESA = @CORR_EMPRESA
		  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
		  AND NUMERO_VERSION > 1;

		DELETE FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION
		WHERE CORR_EMPRESA = @CORR_EMPRESA
		  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

		DELETE FROM dbo.GEN_PLANTILLA_CONTRATO
		WHERE CORR_EMPRESA = @CORR_EMPRESA
		  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

		DECLARE @ELIMINADOS INT = @@ROWCOUNT;

		IF @ELIMINADOS > 0
		BEGIN
			DELETE FROM dbo.GEN_PLANTILLA_CONTRATO_BITACORA
			WHERE CORR_EMPRESA = @CORR_EMPRESA
			  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;
		END

		COMMIT TRAN;

		SELECT @ELIMINADOS AS RESULTADO_DELETE;
	END
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0
		ROLLBACK TRAN;
	THROW;
END CATCH;";

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO", Value = Data.CORR_PLANTILLA_CONTRATO, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				var resultadoDelete = reader.Read() ? Convert.ToInt32(reader["RESULTADO_DELETE"]) : 0;
				reader.Close();
				reader = null;

				if (resultadoDelete == -2)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "No se puede inactivar una plantilla asignada a un empleado";
					objResultado.ErrorSource = "[GEN_PLANTILLA_CONTRATORepository]";
				}
				else if (resultadoDelete < 0)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "No se puede eliminar la plantilla de contrato porque ya tiene una versión activa.";
					objResultado.ErrorSource = "[GEN_PLANTILLA_CONTRATORepository]";
				}
				else if (resultadoDelete == 0)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "No se encontró la plantilla de contrato a eliminar.";
					objResultado.ErrorSource = "[GEN_PLANTILLA_CONTRATORepository]";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = resultadoDelete;
					objResultado.CodeHelper = Data.CORR_PLANTILLA_CONTRATO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
			}
			catch (Exception e)
			{
				var isForeignKey = e.Message.Contains("REFERENCE constraint", StringComparison.OrdinalIgnoreCase) ||
					e.Message.Contains("FOREIGN KEY", StringComparison.OrdinalIgnoreCase);
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = isForeignKey
					? "No se puede eliminar la plantilla de contrato porque tiene registros asociados en otras tablas."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: valida si existe otra plantilla con el mismo nombre en la empresa.
		// Cómo lo hace: consulta V_GEN_PLANTILLA_CONTRATO normalizando espacios y mayúsculas y excluyendo el correlativo propio.
		public async Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr)
		{
			if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(nombre))
			{
				return false;
			}

			const string sql = @"SELECT TOP 1 1 AS FOUND
				FROM V_GEN_PLANTILLA_CONTRATO
				WHERE CORR_EMPRESA = @CORR_EMPRESA
				AND UPPER(LTRIM(RTRIM(NOMBRE_PLANTILLA))) = UPPER(LTRIM(RTRIM(@NOMBRE)))
				AND (@EXCLUDE_CORR <= 0 OR CORR_PLANTILLA_CONTRATO <> @EXCLUDE_CORR)";

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "NOMBRE", Value = nombre.Trim(), DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "EXCLUDE_CORR", Value = excludeCorr, DbType = System.Data.DbType.Int32 },
				});

				var exists = reader.Read();
				reader.Close();
				return exists;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		// Qué hace: obtiene el historial ordenado de versiones y señala cuáles tienen contratos de empleados asociados.
		// Cómo lo hace: consulta V_GEN_PLANTILLA_CONTRATO_VERSION y calcula TIENE_EMPLEADOS por versión.
		public Task<CResult> GetVersionesAsync(List<CParameter> xWhere)
		{
			string sql = SqlAmbitoOrganigrama + @"
SELECT
	V.*,
	CASE
		WHEN V.ES_VERSION_ACTIVA = 1 THEN 'Activa'
		WHEN ESTADO.TIPO_EVENTO = 'ACTIVACION_VERSION' THEN 'Histórica'
		ELSE 'Borrador'
	END AS ESTADO_VERSION,
	CAST(CASE WHEN EXISTS (
		SELECT 1
		FROM dbo.GEN_EMPLEADO_CONTRATO EC
		INNER JOIN dbo.GEN_EMPLEADO EM
			ON EM.CORR_EMPRESA = EC.CORR_EMPRESA
		   AND EM.CORR_EMPLEADO = EC.CORR_EMPLEADO
		WHERE EC.CORR_EMPRESA = V.CORR_EMPRESA
		  AND EC.CORR_PLANTILLA_CONTRATO_VERSION = V.CORR_PLANTILLA_CONTRATO_VERSION
		  AND EC.CORR_EMPLEADO > 0
		  AND EC.ESTADO_CONTRATO IN (1, 2)
	) THEN 1 ELSE 0 END AS BIT) AS TIENE_EMPLEADOS
FROM dbo.V_GEN_PLANTILLA_CONTRATO_VERSION V
OUTER APPLY (
	SELECT TOP 1 B.TIPO_EVENTO
	FROM dbo.GEN_PLANTILLA_CONTRATO_BITACORA B
	INNER JOIN dbo.GEN_PLANTILLA_CONTRATO PC_BIT
		ON PC_BIT.CORR_EMPRESA = B.CORR_EMPRESA
	   AND PC_BIT.CORR_PLANTILLA_CONTRATO = B.CORR_PLANTILLA_CONTRATO
	WHERE B.CORR_EMPRESA = V.CORR_EMPRESA
	  AND B.CORR_PLANTILLA_CONTRATO = V.CORR_PLANTILLA_CONTRATO
	  AND B.CORR_PLANTILLA_CONTRATO_VERSION = V.CORR_PLANTILLA_CONTRATO_VERSION
	  AND B.TIPO_EVENTO IN ('CREACION_VERSION', 'NUEVA_VERSION', 'ACTIVACION_VERSION', 'INACTIVACION_VERSION')
	  AND (
			PC_BIT.FECHA_CREA IS NULL
			OR (
				CONVERT(datetime2(3), COALESCE(B.FECHA_CREA, B.FECHA_ACCION)) >= CONVERT(datetime2(3), PC_BIT.FECHA_CREA)
				AND CONVERT(datetime2(3), COALESCE(B.FECHA_ACCION, B.FECHA_CREA)) >= CONVERT(datetime2(3), PC_BIT.FECHA_CREA)
			)
		  )
	ORDER BY B.FECHA_ACCION DESC, B.CORR_BITACORA DESC
) ESTADO
WHERE V.CORR_EMPRESA = @CORR_EMPRESA
  AND V.CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
  AND EXISTS (
	SELECT 1
	FROM dbo.GEN_PLANTILLA_CONTRATO PC
	WHERE PC.CORR_EMPRESA = V.CORR_EMPRESA
	  AND PC.CORR_PLANTILLA_CONTRATO = V.CORR_PLANTILLA_CONTRATO
	  AND " + SqlPlantillaEnAmbito + @"
  )
ORDER BY V.NUMERO_VERSION ASC
OPTION (MAXRECURSION 20);";

			return QueryListAsync<GEN_PLANTILLA_CONTRATO_VERSIONView>(sql, xWhere);
		}

		// Qué hace: obtiene la bitácora cronológica de la plantilla vigente.
		// Cómo lo hace: filtra por empresa, plantilla y fechas de la bitácora iguales o posteriores a FECHA_CREA del registro activo, con precisión de milisegundos.
		public Task<CResult> GetBitacoraAsync(List<CParameter> xWhere)
		{
			string sql = SqlAmbitoOrganigrama + @"
SELECT *
FROM dbo.V_GEN_PLANTILLA_CONTRATO_BITACORA B
WHERE B.CORR_EMPRESA = @CORR_EMPRESA
  AND B.CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
  AND EXISTS (
	SELECT 1
	FROM dbo.GEN_PLANTILLA_CONTRATO PC
	WHERE PC.CORR_EMPRESA = B.CORR_EMPRESA
	  AND PC.CORR_PLANTILLA_CONTRATO = B.CORR_PLANTILLA_CONTRATO
	  AND (
			PC.FECHA_CREA IS NULL
			OR (
				CONVERT(datetime2(3), COALESCE(B.FECHA_CREA, B.FECHA_ACCION)) >= CONVERT(datetime2(3), PC.FECHA_CREA)
				AND CONVERT(datetime2(3), COALESCE(B.FECHA_ACCION, B.FECHA_CREA)) >= CONVERT(datetime2(3), PC.FECHA_CREA)
			)
		  )
	  AND " + SqlPlantillaEnAmbito + @"
  )
ORDER BY B.FECHA_ACCION DESC, B.CORR_BITACORA DESC
OPTION (MAXRECURSION 20);";

			return QueryListAsync<GEN_PLANTILLA_CONTRATO_BITACORAView>(sql, xWhere);
		}

		// Qué hace: obtiene la lista plana de parámetros para contratos desde la vista SQL.
		// Cómo lo hace: ejecuta SELECT sobre V_GEN_PLANTILLA_CONTRATO_PARAMETROS ordenada por categoría y parámetro.
		public async Task<List<GEN_PLANTILLA_CONTRATO_PARAMETROItem>> GetParametrosDisponiblesAsync()
		{
			const string sql = @"
SELECT
	CATEGORIA,
	ORDEN_CATEGORIA,
	KEY_PARAMETRO,
	LABEL_PARAMETRO,
	DESCRIPCION,
	ORDEN_PARAMETRO
FROM dbo.V_GEN_PLANTILLA_CONTRATO_PARAMETROS
ORDER BY ORDEN_CATEGORIA, ORDEN_PARAMETRO;";

			var result = await QueryListAsync<GEN_PLANTILLA_CONTRATO_PARAMETROItem>(sql, new List<CParameter>());
			return result.Result && result.Data is List<GEN_PLANTILLA_CONTRATO_PARAMETROItem> list
				? list
				: new List<GEN_PLANTILLA_CONTRATO_PARAMETROItem>();
		}

		// Qué hace: obtiene el cuerpo HTML de la Versión 1 registrada para comparar diferencias en bitácora.
		// Cómo lo hace: delega la lectura escalar de CUERPO_PLANTILLA filtrando NUMERO_VERSION = 1.
		public Task<string> GetCuerpoVersionBaseAsync(int corrEmpresa, int corrPlantilla)
		{
			const string sql = @"
SELECT TOP 1 CUERPO_PLANTILLA
FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
  AND NUMERO_VERSION = 1;";

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO", Value = corrPlantilla, DbType = System.Data.DbType.Int32 },
			};

			return GetCuerpoVersionByQueryAsync(sql, p);
		}

		// Qué hace: obtiene el cuerpo HTML guardado de una versión específica para auditar ediciones posteriores.
		// Cómo lo hace: delega la lectura escalar de CUERPO_PLANTILLA filtrando por el correlativo de versión.
		public Task<string> GetCuerpoVersionAsync(int corrEmpresa, int corrPlantilla, int corrVersion)
		{
			const string sql = @"
SELECT TOP 1 CUERPO_PLANTILLA
FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
  AND CORR_PLANTILLA_CONTRATO_VERSION = @CORR_PLANTILLA_CONTRATO_VERSION;";

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO", Value = corrPlantilla, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO_VERSION", Value = corrVersion, DbType = System.Data.DbType.Int32 },
			};

			return GetCuerpoVersionByQueryAsync(sql, p);
		}

		// Qué hace: ejecuta una consulta escalar de CUERPO_PLANTILLA cerrando conexión y lector de forma segura.
		// Cómo lo hace: abre un DataReader de solo lectura, extrae la primera fila no nula y cierra en finally.
		private async Task<string> GetCuerpoVersionByQueryAsync(string sql, List<CParameter> parameters)
		{
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, parameters);
				var cuerpo = reader.Read() && reader["CUERPO_PLANTILLA"] != DBNull.Value
					? reader["CUERPO_PLANTILLA"]?.ToString()
					: null;

				reader.Close();
				reader = null;
				return cuerpo;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		// Qué hace: crea una nueva versión v2+ en Borrador, vinculada siempre a v1 como padre.
		// Cómo lo hace: dentro de transacción busca NUMERO_VERSION = 1, inserta la nueva inactiva y registra el detalle completo de cambios en bitácora.
		public Task<CResult> CrearVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string detalleBitacora, string vLOGIN_SISTEMA, string vESTACION)
		{
			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	DECLARE @NOMBRE_PLANTILLA VARCHAR(200);
	SELECT TOP 1 @NOMBRE_PLANTILLA = NOMBRE_PLANTILLA
	FROM dbo.GEN_PLANTILLA_CONTRATO WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

	IF @NOMBRE_PLANTILLA IS NULL
	BEGIN
		ROLLBACK TRAN;
		SELECT -1 AS RESULTADO_OP, 'No se encontró la plantilla de contrato.' AS MENSAJE_ERROR;
		RETURN;
	END;

	DECLARE @CORR_VERSION_PADRE INT;
	SELECT TOP 1 @CORR_VERSION_PADRE = CORR_PLANTILLA_CONTRATO_VERSION
	FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
	  AND NUMERO_VERSION = 1;

	IF @CORR_VERSION_PADRE IS NULL
	BEGIN
		ROLLBACK TRAN;
		SELECT -2 AS RESULTADO_OP, 'Debe existir primero la Versión 1 antes de crear una nueva versión.' AS MENSAJE_ERROR;
		RETURN;
	END;

	DECLARE @NUMERO_VERSION INT;
	SELECT @NUMERO_VERSION = ISNULL(MAX(NUMERO_VERSION), 0) + 1
	FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

	DECLARE @CORR_NUEVA_VERSION INT;
	SELECT @CORR_NUEVA_VERSION = ISNULL(MAX(CORR_PLANTILLA_CONTRATO_VERSION), 0) + 1
	FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA;

	DECLARE @NOMBRE_VERSION VARCHAR(50) = 'Versión ' + CAST(@NUMERO_VERSION AS VARCHAR(20));

	INSERT INTO dbo.GEN_PLANTILLA_CONTRATO_VERSION
	(
		CORR_EMPRESA,
		CORR_PLANTILLA_CONTRATO_VERSION,
		CORR_PLANTILLA_CONTRATO,
		NUMERO_VERSION,
		NOMBRE_VERSION,
		CORR_VERSION_PADRE,
		CUERPO_PLANTILLA,
		ES_VERSION_ACTIVA,
		OBSERVACION,
		USUARIO_CREA,
		ESTACION_CREA,
		FECHA_CREA,
		USUARIO_ACTU,
		ESTACION_ACTU,
		FECHA_ACTU
	)
	VALUES
	(
		@CORR_EMPRESA,
		@CORR_NUEVA_VERSION,
		@CORR_PLANTILLA_CONTRATO,
		@NUMERO_VERSION,
		@NOMBRE_VERSION,
		@CORR_VERSION_PADRE,
		@CUERPO_PLANTILLA,
		0,
		@OBSERVACION,
		@USUARIO_ACTU,
		@ESTACION_ACTU,
		@FECHA_ACTU,
		@USUARIO_ACTU,
		@ESTACION_ACTU,
		@FECHA_ACTU
	);

	DECLARE @CORR_BITACORA INT;
	SELECT @CORR_BITACORA = ISNULL(MAX(CORR_BITACORA), 0) + 1
	FROM dbo.GEN_PLANTILLA_CONTRATO_BITACORA WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA;

	DECLARE @DETALLE_FINAL NVARCHAR(MAX) = 'Se creó ' + @NOMBRE_VERSION + ' en estado Borrador a partir de la Versión 1.';
	IF NULLIF(LTRIM(RTRIM(ISNULL(@DETALLE_CAMBIOS, N''))), N'') IS NOT NULL
	BEGIN
		SET @DETALLE_FINAL = @DETALLE_FINAL + CHAR(13) + CHAR(10) + @DETALLE_CAMBIOS;
	END;

	INSERT INTO dbo.GEN_PLANTILLA_CONTRATO_BITACORA
	(
		CORR_EMPRESA,
		CORR_BITACORA,
		CORR_PLANTILLA_CONTRATO,
		NOMBRE_PLANTILLA,
		CORR_PLANTILLA_CONTRATO_VERSION,
		NOMBRE_VERSION,
		TIPO_EVENTO,
		DETALLE,
		FECHA_ACCION,
		USUARIO_CREA,
		ESTACION_CREA,
		FECHA_CREA
	)
	VALUES
	(
		@CORR_EMPRESA,
		@CORR_BITACORA,
		@CORR_PLANTILLA_CONTRATO,
		@NOMBRE_PLANTILLA,
		@CORR_NUEVA_VERSION,
		@NOMBRE_VERSION,
		'NUEVA_VERSION',
		@DETALLE_FINAL,
		@FECHA_ACTU,
		@USUARIO_ACTU,
		@ESTACION_ACTU,
		@FECHA_ACTU
	);

	COMMIT TRAN;

	SELECT 0 AS RESULTADO_OP, '' AS MENSAJE_ERROR;

	SELECT *
	FROM dbo.V_GEN_PLANTILLA_CONTRATO_VERSION
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO_VERSION = @CORR_NUEVA_VERSION;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0
		ROLLBACK TRAN;
	THROW;
END CATCH;";

			var fechaActu = DateTime.Now;
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO", Value = Data.CORR_PLANTILLA_CONTRATO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CUERPO_PLANTILLA", Value = (object)Data.CUERPO_PLANTILLA ?? DBNull.Value, DbType = System.Data.DbType.String, Size = -1 },
				new CParameter() { ParameterName = "OBSERVACION", Value = (object)Data.OBSERVACION ?? DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "DETALLE_CAMBIOS", Value = (object)detalleBitacora ?? DBNull.Value, DbType = System.Data.DbType.String, Size = -1 },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = (object)vLOGIN_SISTEMA ?? DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = (object)vESTACION ?? DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = fechaActu, DbType = System.Data.DbType.DateTime },
			};

			return ExecuteVersionMutationAsync(sql, p);
		}

		// Qué hace: actualiza el contenido HTML de cualquier versión, incluida la Versión 1, y registra los cambios en bitácora.
		// Cómo lo hace: si el cuerpo cambió, actualiza CUERPO_PLANTILLA e inserta el diff en bitácora.
		public Task<CResult> ActualizarVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string detalleBitacora, string vLOGIN_SISTEMA, string vESTACION)
		{
			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	DECLARE @NUMERO_OBJETIVO INT;
	DECLARE @NOMBRE_VERSION VARCHAR(50);
	DECLARE @ES_ACTIVA BIT;
	DECLARE @CUERPO_ANTERIOR NVARCHAR(MAX);

	SELECT TOP 1
		@NUMERO_OBJETIVO = NUMERO_VERSION,
		@NOMBRE_VERSION = NOMBRE_VERSION,
		@ES_ACTIVA = ES_VERSION_ACTIVA,
		@CUERPO_ANTERIOR = CUERPO_PLANTILLA
	FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
	  AND CORR_PLANTILLA_CONTRATO_VERSION = @CORR_PLANTILLA_CONTRATO_VERSION;

	IF @NUMERO_OBJETIVO IS NULL
	BEGIN
		ROLLBACK TRAN;
		SELECT -1 AS RESULTADO_OP, 'No se encontró la versión seleccionada.' AS MENSAJE_ERROR;
		RETURN;
	END;

	IF ISNULL(@CUERPO_ANTERIOR, N'') <> ISNULL(@CUERPO_PLANTILLA, N'')
	BEGIN
		DECLARE @NOMBRE_PLANTILLA VARCHAR(200);
		SELECT TOP 1 @NOMBRE_PLANTILLA = NOMBRE_PLANTILLA
		FROM dbo.GEN_PLANTILLA_CONTRATO WITH (UPDLOCK, HOLDLOCK)
		WHERE CORR_EMPRESA = @CORR_EMPRESA
		  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

		UPDATE dbo.GEN_PLANTILLA_CONTRATO_VERSION
		SET CUERPO_PLANTILLA = @CUERPO_PLANTILLA,
			USUARIO_ACTU = @USUARIO_ACTU,
			ESTACION_ACTU = @ESTACION_ACTU,
			FECHA_ACTU = @FECHA_ACTU
		WHERE CORR_EMPRESA = @CORR_EMPRESA
		  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
		  AND CORR_PLANTILLA_CONTRATO_VERSION = @CORR_PLANTILLA_CONTRATO_VERSION;

		DECLARE @CORR_BITACORA INT;
		SELECT @CORR_BITACORA = ISNULL(MAX(CORR_BITACORA), 0) + 1
		FROM dbo.GEN_PLANTILLA_CONTRATO_BITACORA WITH (UPDLOCK, HOLDLOCK)
		WHERE CORR_EMPRESA = @CORR_EMPRESA;

		DECLARE @DETALLE_FINAL NVARCHAR(MAX) = 'Se actualizó ' + @NOMBRE_VERSION + '.';
		IF NULLIF(LTRIM(RTRIM(ISNULL(@DETALLE_CAMBIOS, N''))), N'') IS NOT NULL
		BEGIN
			SET @DETALLE_FINAL = @DETALLE_FINAL + CHAR(13) + CHAR(10) + @DETALLE_CAMBIOS;
		END;

		INSERT INTO dbo.GEN_PLANTILLA_CONTRATO_BITACORA
		(
			CORR_EMPRESA,
			CORR_BITACORA,
			CORR_PLANTILLA_CONTRATO,
			NOMBRE_PLANTILLA,
			CORR_PLANTILLA_CONTRATO_VERSION,
			NOMBRE_VERSION,
			TIPO_EVENTO,
			DETALLE,
			FECHA_ACCION,
			USUARIO_CREA,
			ESTACION_CREA,
			FECHA_CREA
		)
		VALUES
		(
			@CORR_EMPRESA,
			@CORR_BITACORA,
			@CORR_PLANTILLA_CONTRATO,
			@NOMBRE_PLANTILLA,
			@CORR_PLANTILLA_CONTRATO_VERSION,
			@NOMBRE_VERSION,
			'ACTUALIZACION_VERSION',
			@DETALLE_FINAL,
			@FECHA_ACTU,
			@USUARIO_ACTU,
			@ESTACION_ACTU,
			@FECHA_ACTU
		);
	END;

	COMMIT TRAN;

	SELECT 0 AS RESULTADO_OP, '' AS MENSAJE_ERROR;

	SELECT *
	FROM dbo.V_GEN_PLANTILLA_CONTRATO_VERSION
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO_VERSION = @CORR_PLANTILLA_CONTRATO_VERSION;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0
		ROLLBACK TRAN;
	THROW;
END CATCH;";

			var fechaActu = DateTime.Now;
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO", Value = Data.CORR_PLANTILLA_CONTRATO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO_VERSION", Value = Data.CORR_PLANTILLA_CONTRATO_VERSION, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CUERPO_PLANTILLA", Value = (object)Data.CUERPO_PLANTILLA ?? DBNull.Value, DbType = System.Data.DbType.String, Size = -1 },
				new CParameter() { ParameterName = "DETALLE_CAMBIOS", Value = (object)detalleBitacora ?? DBNull.Value, DbType = System.Data.DbType.String, Size = -1 },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = (object)vLOGIN_SISTEMA ?? DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = (object)vESTACION ?? DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = fechaActu, DbType = System.Data.DbType.DateTime },
			};

			return ExecuteVersionMutationAsync(sql, p);
		}

		// Qué hace: activa cualquier versión, incluida la Versión 1, y pasa las demás activas a histórico.
		// Cómo lo hace: verifica existencia, pone ES_VERSION_ACTIVA = 0 en las vigentes y 1 en la seleccionada, y registra bitácora.
		public Task<CResult> ActivarVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	DECLARE @NUMERO_OBJETIVO INT;
	DECLARE @NOMBRE_VERSION VARCHAR(50);
	DECLARE @YA_ACTIVA BIT;

	SELECT TOP 1
		@NUMERO_OBJETIVO = NUMERO_VERSION,
		@NOMBRE_VERSION = NOMBRE_VERSION,
		@YA_ACTIVA = ES_VERSION_ACTIVA
	FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
	  AND CORR_PLANTILLA_CONTRATO_VERSION = @CORR_PLANTILLA_CONTRATO_VERSION;

	IF @NUMERO_OBJETIVO IS NULL
	BEGIN
		ROLLBACK TRAN;
		SELECT -1 AS RESULTADO_OP, 'No se encontró la versión seleccionada.' AS MENSAJE_ERROR;
		RETURN;
	END;

	IF @YA_ACTIVA = 1
	BEGIN
		ROLLBACK TRAN;
		SELECT -3 AS RESULTADO_OP, 'La versión seleccionada ya se encuentra activa.' AS MENSAJE_ERROR;
		RETURN;
	END;

	DECLARE @NOMBRE_PLANTILLA VARCHAR(200);
	SELECT TOP 1 @NOMBRE_PLANTILLA = NOMBRE_PLANTILLA
	FROM dbo.GEN_PLANTILLA_CONTRATO WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

	DECLARE @NOMBRE_ANTERIOR VARCHAR(50);
	SELECT TOP 1 @NOMBRE_ANTERIOR = NOMBRE_VERSION
	FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
	  AND ES_VERSION_ACTIVA = 1
	  AND CORR_PLANTILLA_CONTRATO_VERSION <> @CORR_PLANTILLA_CONTRATO_VERSION;

	UPDATE dbo.GEN_PLANTILLA_CONTRATO_VERSION
	SET ES_VERSION_ACTIVA = 0,
		USUARIO_ACTU = @USUARIO_ACTU,
		ESTACION_ACTU = @ESTACION_ACTU,
		FECHA_ACTU = @FECHA_ACTU
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
	  AND ES_VERSION_ACTIVA = 1;

	UPDATE dbo.GEN_PLANTILLA_CONTRATO_VERSION
	SET ES_VERSION_ACTIVA = 1,
		USUARIO_ACTU = @USUARIO_ACTU,
		ESTACION_ACTU = @ESTACION_ACTU,
		FECHA_ACTU = @FECHA_ACTU
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
	  AND CORR_PLANTILLA_CONTRATO_VERSION = @CORR_PLANTILLA_CONTRATO_VERSION;

	DECLARE @CORR_BITACORA INT;
	SELECT @CORR_BITACORA = ISNULL(MAX(CORR_BITACORA), 0) + 1
	FROM dbo.GEN_PLANTILLA_CONTRATO_BITACORA WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA;

	INSERT INTO dbo.GEN_PLANTILLA_CONTRATO_BITACORA
	(
		CORR_EMPRESA,
		CORR_BITACORA,
		CORR_PLANTILLA_CONTRATO,
		NOMBRE_PLANTILLA,
		CORR_PLANTILLA_CONTRATO_VERSION,
		NOMBRE_VERSION,
		TIPO_EVENTO,
		DETALLE,
		FECHA_ACCION,
		USUARIO_CREA,
		ESTACION_CREA,
		FECHA_CREA
	)
	VALUES
	(
		@CORR_EMPRESA,
		@CORR_BITACORA,
		@CORR_PLANTILLA_CONTRATO,
		@NOMBRE_PLANTILLA,
		@CORR_PLANTILLA_CONTRATO_VERSION,
		@NOMBRE_VERSION,
		'ACTIVACION_VERSION',
		LEFT(
			CASE
				WHEN @NOMBRE_ANTERIOR IS NULL THEN 'Se estableció ' + @NOMBRE_VERSION + ' como versión activa.'
				ELSE 'Se estableció ' + @NOMBRE_VERSION + ' como versión activa. ' + @NOMBRE_ANTERIOR + ' pasó a histórico.'
			END,
			1000
		),
		@FECHA_ACTU,
		@USUARIO_ACTU,
		@ESTACION_ACTU,
		@FECHA_ACTU
	);

	COMMIT TRAN;

	SELECT 0 AS RESULTADO_OP, '' AS MENSAJE_ERROR;

	SELECT *
	FROM dbo.V_GEN_PLANTILLA_CONTRATO_VERSION
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO_VERSION = @CORR_PLANTILLA_CONTRATO_VERSION;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0
		ROLLBACK TRAN;
	THROW;
END CATCH;";

			var fechaActu = DateTime.Now;
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO", Value = Data.CORR_PLANTILLA_CONTRATO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO_VERSION", Value = Data.CORR_PLANTILLA_CONTRATO_VERSION, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = (object)vLOGIN_SISTEMA ?? DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = (object)vESTACION ?? DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = fechaActu, DbType = System.Data.DbType.DateTime },
			};

			return ExecuteVersionMutationAsync(sql, p);
		}

		// Qué hace: inactiva una versión activa sin contratos de empleados asociados.
		// Cómo lo hace: valida la asignación dentro de la transacción antes de cambiar el estado y registrar bitácora.
		public Task<CResult> InactivarPlantillaAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	DECLARE @CORR_VERSION_OBJETIVO INT;
	DECLARE @NOMBRE_VERSION VARCHAR(50);
	DECLARE @ES_ACTIVA BIT;

	SELECT TOP 1
		@CORR_VERSION_OBJETIVO = CORR_PLANTILLA_CONTRATO_VERSION,
		@NOMBRE_VERSION = NOMBRE_VERSION,
		@ES_ACTIVA = ES_VERSION_ACTIVA
	FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
	  AND (
			(@CORR_PLANTILLA_CONTRATO_VERSION > 0 AND CORR_PLANTILLA_CONTRATO_VERSION = @CORR_PLANTILLA_CONTRATO_VERSION)
			OR (@CORR_PLANTILLA_CONTRATO_VERSION <= 0 AND ES_VERSION_ACTIVA = 1)
		  );

	IF @CORR_VERSION_OBJETIVO IS NULL
	BEGIN
		ROLLBACK TRAN;
		SELECT -1 AS RESULTADO_OP, 'No se encontró la versión seleccionada.' AS MENSAJE_ERROR;
		RETURN;
	END;

	IF @ES_ACTIVA = 0
	BEGIN
		ROLLBACK TRAN;
		SELECT -3 AS RESULTADO_OP, 'La versión seleccionada ya está en Borrador o histórico.' AS MENSAJE_ERROR;
		RETURN;
	END;

	IF OBJECT_ID('dbo.GEN_EMPLEADO_CONTRATO', 'U') IS NOT NULL
	   AND EXISTS (
			SELECT 1
			FROM dbo.GEN_EMPLEADO_CONTRATO EC WITH (UPDLOCK, HOLDLOCK)
			INNER JOIN dbo.GEN_EMPLEADO EM
				ON EM.CORR_EMPRESA = EC.CORR_EMPRESA
			   AND EM.CORR_EMPLEADO = EC.CORR_EMPLEADO
			INNER JOIN dbo.GEN_PLANTILLA_CONTRATO_VERSION PV
				ON PV.CORR_EMPRESA = EC.CORR_EMPRESA
			   AND PV.CORR_PLANTILLA_CONTRATO_VERSION = EC.CORR_PLANTILLA_CONTRATO_VERSION
			WHERE EC.CORR_EMPRESA = @CORR_EMPRESA
			  AND PV.CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
			  AND EC.CORR_EMPLEADO > 0
			  AND EC.ESTADO_CONTRATO IN (1, 2)
			  AND (
					EC.CORR_PLANTILLA_CONTRATO_VERSION = @CORR_VERSION_OBJETIVO
					OR NOT EXISTS (
						SELECT 1
						FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION VA WITH (UPDLOCK, HOLDLOCK)
						WHERE VA.CORR_EMPRESA = @CORR_EMPRESA
						  AND VA.CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
						  AND VA.ES_VERSION_ACTIVA = 1
						  AND VA.CORR_PLANTILLA_CONTRATO_VERSION <> @CORR_VERSION_OBJETIVO
					)
			  )
	   )
	BEGIN
		ROLLBACK TRAN;
		SELECT -2 AS RESULTADO_OP, 'No se puede inactivar la versión porque existe una versión asignada a un empleado.' AS MENSAJE_ERROR;
		RETURN;
	END;

	DECLARE @NOMBRE_PLANTILLA VARCHAR(200);
	SELECT TOP 1 @NOMBRE_PLANTILLA = NOMBRE_PLANTILLA
	FROM dbo.GEN_PLANTILLA_CONTRATO WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

	UPDATE dbo.GEN_PLANTILLA_CONTRATO_VERSION
	SET ES_VERSION_ACTIVA = 0,
		USUARIO_ACTU = @USUARIO_ACTU,
		ESTACION_ACTU = @ESTACION_ACTU,
		FECHA_ACTU = @FECHA_ACTU
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
	  AND CORR_PLANTILLA_CONTRATO_VERSION = @CORR_VERSION_OBJETIVO
	  AND ES_VERSION_ACTIVA = 1;

	DECLARE @CORR_BITACORA INT;
	SELECT @CORR_BITACORA = ISNULL(MAX(CORR_BITACORA), 0) + 1
	FROM dbo.GEN_PLANTILLA_CONTRATO_BITACORA WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA;

	INSERT INTO dbo.GEN_PLANTILLA_CONTRATO_BITACORA
	(
		CORR_EMPRESA,
		CORR_BITACORA,
		CORR_PLANTILLA_CONTRATO,
		NOMBRE_PLANTILLA,
		CORR_PLANTILLA_CONTRATO_VERSION,
		NOMBRE_VERSION,
		TIPO_EVENTO,
		DETALLE,
		FECHA_ACCION,
		USUARIO_CREA,
		ESTACION_CREA,
		FECHA_CREA
	)
	VALUES
	(
		@CORR_EMPRESA,
		@CORR_BITACORA,
		@CORR_PLANTILLA_CONTRATO,
		@NOMBRE_PLANTILLA,
		@CORR_VERSION_OBJETIVO,
		@NOMBRE_VERSION,
		'INACTIVACION_VERSION',
		LEFT('Se inactivó ' + @NOMBRE_VERSION + ' y pasó a estado Borrador.', 1000),
		@FECHA_ACTU,
		@USUARIO_ACTU,
		@ESTACION_ACTU,
		@FECHA_ACTU
	);

	COMMIT TRAN;

	SELECT 0 AS RESULTADO_OP, '' AS MENSAJE_ERROR;

	SELECT *
	FROM dbo.V_GEN_PLANTILLA_CONTRATO_VERSION
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO_VERSION = @CORR_VERSION_OBJETIVO;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0
		ROLLBACK TRAN;
	THROW;
END CATCH;";

			var fechaActu = DateTime.Now;
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO", Value = Data.CORR_PLANTILLA_CONTRATO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO_VERSION", Value = Data.CORR_PLANTILLA_CONTRATO_VERSION, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = (object)vLOGIN_SISTEMA ?? DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = (object)vESTACION ?? DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = fechaActu, DbType = System.Data.DbType.DateTime },
			};

			return ExecuteVersionMutationAsync(sql, p);
		}

		// Qué hace: ejecuta consultas de lectura que devuelven listas tipadas para versiones o bitácora.
		// Cómo lo hace: abre lector con GetDataReader, materializa List<T> con FromDataReader y encapsula errores en CResult.
		private async Task<CResult> QueryListAsync<T>(string sql, List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, xWhere);
				var response = new List<T>().FromDataReader(reader).ToList();

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
			catch (Exception e)
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

		// Qué hace: ejecuta comandos transaccionales de versiones que retornan estado operativo y luego la fila resultante.
		// Cómo lo hace: lee RESULTADO_OP/MENSAJE_ERROR del primer conjunto y, si es 0, materializa V_GEN_PLANTILLA_CONTRATO_VERSION del segundo.
		private async Task<CResult> ExecuteVersionMutationAsync(string sql, List<CParameter> parameters)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, parameters);
				var resultadoOp = -1;
				var mensajeError = "No se pudo completar la operación sobre la versión.";

				if (reader.Read())
				{
					resultadoOp = Convert.ToInt32(reader["RESULTADO_OP"]);
					mensajeError = reader["MENSAJE_ERROR"]?.ToString() ?? string.Empty;
				}

				if (resultadoOp != 0)
				{
					reader.Close();
					reader = null;

					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = mensajeError;
					objResultado.ErrorSource = "[GEN_PLANTILLA_CONTRATORepository]";
					return objResultado;
				}

				GEN_PLANTILLA_CONTRATO_VERSIONView response = null;
				if (await reader.NextResultAsync())
				{
					response = new List<GEN_PLANTILLA_CONTRATO_VERSIONView>().FromDataReader(reader).FirstOrDefault();
				}

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_PLANTILLA_CONTRATO_VERSION ?? 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = string.IsNullOrWhiteSpace(mensajeError) ? "" : mensajeError;
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				SetSaveError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: completa la respuesta de error al fallar una operación de guardado.
		// Cómo lo hace: detecta si fue llave duplicada (2627) y asigna código, mensaje y origen al CResult.
		private static void SetSaveError(CResult objResultado, Exception e)
		{
			var duplicateKey = IsDuplicateKeyError(e);
			objResultado.Data = null;
			objResultado.Result = false;
			objResultado.CodeHelper = 0;
			objResultado.ErrorCode = duplicateKey ? 2627 : -1;
			objResultado.ErrorMessage = duplicateKey
				? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
				: e.Message;
			objResultado.ErrorSource += $"[{e.Source}]";
		}

		// Qué hace: detecta excepciones de clave duplicada en SQL Server.
		// Cómo lo hace: verifica mensajes estándar de PRIMARY KEY, UNIQUE KEY o duplicate key.
		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
		}
	}
}

