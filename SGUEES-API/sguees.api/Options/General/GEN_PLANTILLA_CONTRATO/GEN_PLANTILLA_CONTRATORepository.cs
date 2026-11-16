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

		public GEN_PLANTILLA_CONTRATORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Qué hace: lista las plantillas de contrato de la empresa actual de la más reciente a la más antigua.
		// Cómo lo hace: consulta V_GEN_PLANTILLA_CONTRATO filtrando por CORR_EMPRESA y ordena descendentemente por CORR_PLANTILLA_CONTRATO.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var dbWhere = xWhere
					.Where(x => x.ParameterName == "CORR_EMPRESA")
					.ToList();

				var reader = await objData.GetDataReader(_ViewName, dbWhere);
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

		// Qué hace: consulta una plantilla de contrato puntual por su clave.
		// Cómo lo hace: consulta V_GEN_PLANTILLA_CONTRATO con los filtros recibidos y devuelve el primer registro.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
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

		// Qué hace: actualiza el encabezado de la plantilla y consolida v1 si continúa en Borrador con contenido.
		// Cómo lo hace: actualiza GEN_PLANTILLA_CONTRATO; nunca sobrescribe versiones ya existentes e inserta v1 (padre NULL) y su bitácora solo cuando no existen versiones previas.
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
				1,
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
				LEFT('Se consolidó la Versión 1 inicial (Activa) para ""' + @NOMBRE_PLANTILLA + '"".', 1000),
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

		// Qué hace: elimina una plantilla de contrato únicamente si continúa en estado Borrador (sin versiones).
		// Cómo lo hace: verifica dentro de una transacción que no existan filas en GEN_PLANTILLA_CONTRATO_VERSION y luego ejecuta DELETE sobre GEN_PLANTILLA_CONTRATO.
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
	)
	BEGIN
		ROLLBACK TRAN;
		SELECT -1 AS RESULTADO_DELETE;
	END
	ELSE
	BEGIN
		DECLARE @NOMBRE_ELIMINADA VARCHAR(200);
		SELECT TOP 1 @NOMBRE_ELIMINADA = NOMBRE_PLANTILLA
		FROM dbo.GEN_PLANTILLA_CONTRATO WITH (UPDLOCK, HOLDLOCK)
		WHERE CORR_EMPRESA = @CORR_EMPRESA
		  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

		DELETE FROM dbo.GEN_PLANTILLA_CONTRATO
		WHERE CORR_EMPRESA = @CORR_EMPRESA
		  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

		DECLARE @ELIMINADOS INT = @@ROWCOUNT;

		IF @ELIMINADOS > 0
		BEGIN
			DECLARE @CORR_BITACORA_DEL INT;
			SELECT @CORR_BITACORA_DEL = ISNULL(MAX(CORR_BITACORA), 0) + 1
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
				@CORR_BITACORA_DEL,
				@CORR_PLANTILLA_CONTRATO,
				@NOMBRE_ELIMINADA,
				NULL,
				NULL,
				'ELIMINACION_BORRADOR',
				LEFT('Se eliminó la plantilla en borrador ""' + ISNULL(@NOMBRE_ELIMINADA, '') + '"".', 1000),
				@FECHA_ACCION,
				@USUARIO_ACCION,
				@ESTACION_ACCION,
				@FECHA_ACCION
			);
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
					new CParameter() { ParameterName = "USUARIO_ACCION", Value = (object)vLOGIN_SISTEMA ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACCION", Value = (object)vESTACION ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACCION", Value = DateTime.Now, DbType = System.Data.DbType.DateTime },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				var resultadoDelete = reader.Read() ? Convert.ToInt32(reader["RESULTADO_DELETE"]) : 0;
				reader.Close();
				reader = null;

				if (resultadoDelete < 0)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "No se puede eliminar la plantilla de contrato porque ya tiene una versión activa o historial de versiones.";
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

		// Qué hace: obtiene el historial ordenado de versiones de una plantilla de contrato.
		// Cómo lo hace: consulta V_GEN_PLANTILLA_CONTRATO_VERSION filtrando por empresa y plantilla ordenada por NUMERO_VERSION.
		public Task<CResult> GetVersionesAsync(List<CParameter> xWhere)
		{
			const string sql = @"
SELECT *
FROM dbo.V_GEN_PLANTILLA_CONTRATO_VERSION
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
ORDER BY NUMERO_VERSION ASC;";

			return QueryListAsync<GEN_PLANTILLA_CONTRATO_VERSIONView>(sql, xWhere);
		}

		// Qué hace: obtiene la bitácora cronológica de una plantilla de contrato.
		// Cómo lo hace: consulta V_GEN_PLANTILLA_CONTRATO_BITACORA filtrando por empresa y plantilla de más reciente a más antigua.
		public Task<CResult> GetBitacoraAsync(List<CParameter> xWhere)
		{
			const string sql = @"
SELECT *
FROM dbo.V_GEN_PLANTILLA_CONTRATO_BITACORA
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
ORDER BY FECHA_ACCION DESC, CORR_BITACORA DESC;";

			return QueryListAsync<GEN_PLANTILLA_CONTRATO_BITACORAView>(sql, xWhere);
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

		// Qué hace: crea una nueva versión v2+ vinculada siempre a v1 como padre, la activa y deja v1 y anteriores como históricas.
		// Cómo lo hace: dentro de transacción busca NUMERO_VERSION = 1, desactiva la versión activa actual, inserta la nueva con CORR_VERSION_PADRE = v1 y registra el detalle completo de cambios en bitácora.
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

	UPDATE dbo.GEN_PLANTILLA_CONTRATO_VERSION
	SET ES_VERSION_ACTIVA = 0,
		USUARIO_ACTU = @USUARIO_ACTU,
		ESTACION_ACTU = @ESTACION_ACTU,
		FECHA_ACTU = @FECHA_ACTU
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO
	  AND ES_VERSION_ACTIVA = 1;

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
		1,
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

	DECLARE @DETALLE_FINAL NVARCHAR(MAX) = 'Se creó ' + @NOMBRE_VERSION + ' a partir de la Versión 1.';
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

		// Qué hace: actualiza el contenido HTML de la versión v2+ activa actual y registra los cambios en bitácora.
		// Cómo lo hace: verifica dentro de transacción que sea v2+ activa; si el cuerpo cambió, actualiza CUERPO_PLANTILLA e inserta el diff en bitácora.
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

	IF @NUMERO_OBJETIVO = 1
	BEGIN
		ROLLBACK TRAN;
		SELECT -2 AS RESULTADO_OP, 'La Versión 1 permanece inhabilitada y no puede modificarse directamente.' AS MENSAJE_ERROR;
		RETURN;
	END;

	IF @ES_ACTIVA = 0
	BEGIN
		ROLLBACK TRAN;
		SELECT -3 AS RESULTADO_OP, 'Solo la versión activa actual (Versión 2+) puede editarse directamente.' AS MENSAJE_ERROR;
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

		// Qué hace: activa una versión histórica elegible (v2+) desactivando la versión activa anterior.
		// Cómo lo hace: verifica existencia, bloquea reactivar v1 si existen versiones v2+, actualiza ES_VERSION_ACTIVA y registra bitácora.
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

	DECLARE @CANT_VERSIONES INT;
	SELECT @CANT_VERSIONES = COUNT(*)
	FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_PLANTILLA_CONTRATO = @CORR_PLANTILLA_CONTRATO;

	IF @NUMERO_OBJETIVO = 1 AND @CANT_VERSIONES > 1
	BEGIN
		ROLLBACK TRAN;
		SELECT -2 AS RESULTADO_OP, 'La Versión 1 permanece como Formato Padre de referencia (inhabilitada) y no puede volver a activarse.' AS MENSAJE_ERROR;
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
		LEFT('Se estableció ' + @NOMBRE_VERSION + ' como versión activa.', 1000),
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

