SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO
-- =============================================================================
-- Procedimiento: dbo.PRAL_MTTO_ACA_PROSPECTO_NUEVO_INGRESO_AUTORIZA
-- Pantalla / portal: Solicitud de nuevo ingreso (tipo de documento 104)
--
-- Qué hace:
--   Ejecuta el primer movimiento del flujo de nuevo ingreso cuando el
--   aspirante envía su documentación (portal /student-profile), o cuando
--   se inicie el flujo desde el ERP.
--   OPERACION = 1 inicia el flujo (portal).
--   OPERACION = 3 aprueba: ejecutor del paso actual, acción hacia 39 Aprobado.
--                 Esa acción AVANZA al paso Solicitud aprobada. La instancia sigue activa.
--   OPERACION = 4 rechaza: ejecutor del paso actual, acción hacia 46 Rechazada.
--   OPERACION = 5 revierte: la solicitud está en Solicitud aprobada (estado 39).
--                 El ejecutor de ese paso usa la acción Retorna y vuelve a
--                 Aprobación del analista, estado 38 Ingresado.
--
-- Importante:
--   Este procedimiento NO guarda datos personales ni archivos.
--   Eso ya lo hizo el portal. Aquí solo mueve el flujo 104, sincroniza
--   ACA_PROSPECTO_ESTADO y bloquea el portal con ACA_PROSPECTO.ESTADO = 'C'.
--
-- Requisitos previos (script Scripts/ACA_PROSPECTO_NUEVO_INGRESO_FLUJO_PREPARAR.sql):
--   1) CODIGO_OPCION por tipo (FK a SEG_OPCION_SISTEMA / menú ya existente):
--        104 → ACA_PROSPECTO
--        105 → ACA_PROSPECTO_SOCIOECONOMICO
--        106 → ACA_PROSPECTO_BECA
--   2) Acción del paso 18 sin notificación obligatoria, o con analistas
--      asignados al actor 7.
--
-- Cómo lo hace (espejo del descriptor PRAL_MTTO_SC_DESCRIPTOR_PUESTO_AUTORIZA):
--   1) Valida prospecto, login (SEG_USUARIO activo), comentario y unidad.
--   2) Resuelve tipo 104 / flujo defecto / paso inicial (ORDEN 1 = 18).
--   3) Si ya hay instancia activa del tipo 104 → no vuelve a enviar.
--   4) Llama a EjecutarFlujoProceso con acción 1 (FASE 2A):
--        crea SEG_FLUJO_INSTANCIA + bitácora y, según la config actual,
--        AVANZA al paso 19 (Aprobación del analista) con estado 38 Ingresado.
--   5) Inserta ACA_PROSPECTO_ESTADO (104, estado resultante) si no existe.
--   6) Pone ACA_PROSPECTO.ESTADO = 'C' (lock del portal).
--
-- @OPERACION:
--   1 = ENVIAR / Iniciar flujo de nuevo ingreso.
--   3 = APROBAR (ejecutor del paso actual; estado destino 39).
--   4 = RECHAZAR (ejecutor del paso actual; estado destino 46).
--   5 = REVERTIR (paso Solicitud aprobada; Retorna a 38 en Aprobación del analista).
--
-- @LOGIN_SISTEMA:
--   Debe existir en SEG_USUARIO y estar activo. El aspirante del portal
--   normalmente NO está en SEG_USUARIO; el back de admisiones debe pasar
--   un login de servicio (ej. juanh o uno dedicado al portal).
--
-- @CORR_UNIDAD_DOCUMENTO:
--   Obligatorio la primera vez (el motor lo guarda en la instancia).
--
-- Códigos RETURN:
--    0 = ok
--   -1 = faltan datos o el prospecto no existe
--   -2 = no hay tipo de documento 104 / CODIGO_OPCION
--   -3 = no hay flujo defecto del tipo 104
--   -4 = no hay paso inicial
--   -5 = @OPERACION no soportada
--   -7 = no hay acción 1 en el paso inicial
--   -8 = falta @CORR_UNIDAD_DOCUMENTO
--  -10 = falló EjecutarFlujoProceso (detalle en @MENSAJE_ERROR)
--  -12 = la solicitud 104 ya tiene instancia activa (ya enviada)
--  -13 = el login no es el ejecutor del paso
--  -14 = el paso no tiene la acción pedida
--  -15 = no hay instancia para la operación
--  -16 = Revertir solo aplica si el estado actual es Aprobado (39)
-- =============================================================================
CREATE OR ALTER PROCEDURE [dbo].[PRAL_MTTO_ACA_PROSPECTO_NUEVO_INGRESO_AUTORIZA]
(
	@CORR_EMPRESA INT = NULL,
	@CORR_PROSPECTO INT,
	@CORR_UNIDAD_DOCUMENTO INT = NULL,
	@OPERACION INT = 1,
	@LOGIN_SISTEMA VARCHAR(30),
	@OBSERVACION NVARCHAR(MAX),
	@ESTACION VARCHAR(50) = NULL,
	@CORR_ESTADO INT OUTPUT,
	@MENSAJE_ERROR VARCHAR(500) OUTPUT,
	@CORR_ACCION_USADA INT = NULL OUTPUT,
	@CORR_PASO_ACTUAL INT = NULL OUTPUT,
	@MODO VARCHAR(20) = NULL OUTPUT,
	@NOMBRE_ESTADO VARCHAR(100) = NULL OUTPUT
)
AS
BEGIN
	SET NOCOUNT ON;

	-- Tipo fijo de esta solicitud (no socio 105 ni beca 106).
	-- CODIGO_OPCION = opción de menú ya registrada en SEG_OPCION_SISTEMA.
	DECLARE @CODIGO_OPCION VARCHAR(50) = 'ACA_PROSPECTO';
	DECLARE @ID_TIPO_DOCUMENTO INT = 104;
	DECLARE @EMPRESA INT;
	DECLARE @ID_FLUJO INT;
	DECLARE @ID_INSTANCIA INT;
	DECLARE @ID_PASO_INICIAL INT;
	DECLARE @ID_ACCION INT;
	DECLARE @UNIDAD_DOC INT = @CORR_UNIDAD_DOCUMENTO;
	DECLARE @V_ESTACION VARCHAR(50) = ISNULL(NULLIF(LTRIM(RTRIM(@ESTACION)), ''), HOST_NAME());
	DECLARE @V_NOMBRE_ESTADO VARCHAR(100);
	DECLARE @ERROR_MOTOR VARCHAR(500);
	DECLARE @ESTADO_MOTOR INT;
	DECLARE @ACTOR_PASO INT;

	SET @CORR_ESTADO = NULL;
	SET @MENSAJE_ERROR = NULL;
	SET @CORR_ACCION_USADA = NULL;
	SET @CORR_PASO_ACTUAL = NULL;
	SET @MODO = NULL;
	SET @NOMBRE_ESTADO = NULL;

	-- =========================================================================
	-- PASO 1 — Datos de entrada y existencia del prospecto
	-- =========================================================================
	IF @CORR_PROSPECTO IS NULL OR @CORR_PROSPECTO <= 0
	BEGIN
		SET @MENSAJE_ERROR = 'Debe indicar @CORR_PROSPECTO.';
		RETURN -1;
	END

	IF @LOGIN_SISTEMA IS NULL OR LTRIM(RTRIM(@LOGIN_SISTEMA)) = ''
	BEGIN
		SET @MENSAJE_ERROR = 'Debe indicar @LOGIN_SISTEMA (usuario activo en SEG_USUARIO).';
		RETURN -1;
	END

	IF @OBSERVACION IS NULL OR LTRIM(RTRIM(@OBSERVACION)) = ''
	BEGIN
		SET @MENSAJE_ERROR = 'El comentario (@OBSERVACION) es obligatorio.';
		RETURN -1;
	END

	IF @OPERACION IS NULL OR @OPERACION NOT IN (1, 3, 4, 5)
	BEGIN
		SET @MENSAJE_ERROR = 'Operacion no soportada. Use 1=ENVIAR, 3=APROBAR, 4=RECHAZAR o 5=REVERTIR.';
		RETURN -5;
	END

	-- Empresa: la del prospecto (área académica del periodo) o la que manden.
	SELECT @EMPRESA = AA.CORR_EMPRESA
	FROM dbo.ACA_PROSPECTO AS P
	INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS AS PA
		ON PA.CORR_PERIODO_ACADEMICO = P.CORR_PERIODO_ACADEMICO
	INNER JOIN dbo.ACA_AREAS_ACADEMICAS AS AA
		ON AA.CORR_AREA_ACADEMICA = PA.CORR_AREA_ACADEMICA
	WHERE P.CORR_PROSPECTO = @CORR_PROSPECTO;

	IF @EMPRESA IS NULL
	BEGIN
		SET @MENSAJE_ERROR = 'No existe el prospecto CORR_PROSPECTO=' + CAST(@CORR_PROSPECTO AS VARCHAR(20)) + '.';
		RETURN -1;
	END

	IF @CORR_EMPRESA IS NOT NULL AND @CORR_EMPRESA <> @EMPRESA
	BEGIN
		SET @MENSAJE_ERROR = 'La empresa enviada no coincide con la del prospecto.';
		RETURN -1;
	END

	-- =========================================================================
	-- PASO 2 — Configuración del flujo 104
	-- Cómo: exige que el tipo 104 apunte a ACA_PROSPECTO
	--       (105 queda en ACA_PROSPECTO_SOCIOECONOMICO y 106 en ACA_PROSPECTO_BECA).
	-- =========================================================================
	IF NOT EXISTS (
		SELECT 1
		FROM dbo.SEG_FLUJO_TIPO_DOCUMENTO
		WHERE CORR_EMPRESA = @EMPRESA
		  AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
		  AND CODIGO_OPCION = @CODIGO_OPCION
		  AND ACTIVO = 1
	)
	BEGIN
		SET @MENSAJE_ERROR = 'No existe tipo de documento activo para ACA_PROSPECTO.';
		RETURN -2;
	END

	SELECT TOP 1 @ID_FLUJO = CORR_FLUJO_PROCESO
	FROM dbo.SEG_FLUJO_PROCESO
	WHERE CORR_EMPRESA = @EMPRESA
	  AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
	  AND ACTIVO = 1
	  AND ES_DEFECTO = 1
	ORDER BY CORR_FLUJO_PROCESO;

	IF @ID_FLUJO IS NULL
	BEGIN
		SET @MENSAJE_ERROR = 'No hay flujo defecto activo para el tipo 104 (nuevo ingreso).';
		RETURN -3;
	END

	SELECT TOP 1 @ID_PASO_INICIAL = CORR_PASO
	FROM dbo.SEG_FLUJO_PASO
	WHERE CORR_EMPRESA = @EMPRESA
	  AND CORR_FLUJO_PROCESO = @ID_FLUJO
	ORDER BY ORDEN;

	IF @ID_PASO_INICIAL IS NULL
	BEGIN
		SET @MENSAJE_ERROR = 'El flujo 104 no tiene paso inicial (ORDEN=1).';
		RETURN -4;
	END

	-- Acción 1 del paso inicial: la que usa FASE 2A de EjecutarFlujoProceso.
	SELECT TOP 1 @ID_ACCION = CORR_ACCION
	FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
	WHERE CORR_EMPRESA = @EMPRESA
	  AND CORR_FLUJO_PROCESO = @ID_FLUJO
	  AND CORR_PASO = @ID_PASO_INICIAL
	  AND CORR_ACCION = 1
	  AND PERMITIDO = 1
	  AND ACTIVO = 1;

	IF @ID_ACCION IS NULL
	BEGIN
		SET @MENSAJE_ERROR = 'El paso inicial del flujo 104 no tiene accion 1 activa en SEG_FLUJO_PASO_ACCION_ESTADO.';
		RETURN -7;
	END

	SET @CORR_ACCION_USADA = @ID_ACCION;

	-- =========================================================================
	-- PASO 3 — ¿Ya tiene instancia del tipo 104?
	-- =========================================================================
	SELECT @ID_INSTANCIA = CORR_INSTANCIA,
	       @CORR_PASO_ACTUAL = CORR_PASO_ACTUAL,
	       @CORR_ESTADO = CORR_ESTADO_ACTUAL,
	       @UNIDAD_DOC = ISNULL(@UNIDAD_DOC, CORR_UNIDAD_DOCUMENTO)
	FROM dbo.SEG_FLUJO_INSTANCIA
	WHERE CORR_EMPRESA = @EMPRESA
	  AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
	  AND CORR_DOCUMENTO = @CORR_PROSPECTO
	  AND ACTIVO = 1;

	-- Revertir también alcanza una aprobación anterior que cerró la instancia (ACTIVO = 0).
	IF @OPERACION = 5 AND @ID_INSTANCIA IS NULL
	BEGIN
		SELECT TOP 1
		       @ID_INSTANCIA = CORR_INSTANCIA,
		       @CORR_PASO_ACTUAL = CORR_PASO_ACTUAL,
		       @CORR_ESTADO = CORR_ESTADO_ACTUAL,
		       @UNIDAD_DOC = ISNULL(@UNIDAD_DOC, CORR_UNIDAD_DOCUMENTO)
		FROM dbo.SEG_FLUJO_INSTANCIA
		WHERE CORR_EMPRESA = @EMPRESA
		  AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
		  AND CORR_DOCUMENTO = @CORR_PROSPECTO
		  AND CORR_ESTADO_ACTUAL = 39
		ORDER BY CORR_INSTANCIA DESC;
	END

	-- Aprobar, rechazar y revertir: el login tiene que ser el actor origen del paso de esa acción.
	IF @OPERACION IN (3, 4, 5)
	BEGIN
		IF @ID_INSTANCIA IS NULL
		BEGIN
			SET @MENSAJE_ERROR = CASE WHEN @OPERACION = 5
				THEN 'La solicitud no está aprobada para revertir.'
				ELSE 'La solicitud no tiene un flujo activo.' END;
			RETURN -15;
		END

		IF @OPERACION = 5
		BEGIN
			IF ISNULL(@CORR_ESTADO, 0) <> 39
			BEGIN
				SET @MENSAJE_ERROR = 'Revertir solo aplica cuando la solicitud está Aprobada.';
				RETURN -16;
			END

			SET @ID_ACCION = NULL;
			SELECT TOP 1
			       @ID_ACCION = A.CORR_ACCION,
			       @CORR_PASO_ACTUAL = A.CORR_PASO,
			       @ACTOR_PASO = PS.CORR_ACTOR_ORIGEN
			FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO AS A
			INNER JOIN dbo.SEG_FLUJO_PASO AS PS
				ON PS.CORR_EMPRESA = A.CORR_EMPRESA AND PS.CORR_PASO = A.CORR_PASO
			WHERE A.CORR_EMPRESA = @EMPRESA
			  AND A.CORR_FLUJO_PROCESO = @ID_FLUJO
			  AND A.CORR_TIPO_MOVIMIENTO = 2
			  AND A.CORR_ESTADO_DESTINO = 38
			  AND A.CORR_PASO_DESTINO IS NOT NULL
			  AND A.PERMITIDO = 1
			  AND A.ACTIVO = 1
			ORDER BY A.CORR_ACCION;

			IF @ID_ACCION IS NULL
			BEGIN
				SET @MENSAJE_ERROR = 'El paso Solicitud aprobada no tiene la accion Retorna hacia Ingresado.';
				RETURN -14;
			END

			IF @ACTOR_PASO IS NULL
			   OR ISNULL(dbo.SEG_FN_UsuarioMatchActorUnidad(LTRIM(RTRIM(@LOGIN_SISTEMA)), @ACTOR_PASO, @UNIDAD_DOC, @EMPRESA), 0) <> 1
			BEGIN
				SET @MENSAJE_ERROR = 'El usuario no es el ejecutor del paso para revertir.';
				RETURN -13;
			END

			-- La instancia queda activa en Solicitud aprobada para que el motor ejecute Retorna.
			UPDATE dbo.SEG_FLUJO_INSTANCIA
			SET ACTIVO = 1,
			    CORR_PASO_ACTUAL = @CORR_PASO_ACTUAL
			WHERE CORR_EMPRESA = @EMPRESA
			  AND CORR_INSTANCIA = @ID_INSTANCIA;

			SET @CORR_ACCION_USADA = @ID_ACCION;
			SET @MODO = 'REVERTIR';
		END
		ELSE
		BEGIN
			IF ISNULL(@CORR_ESTADO, 0) <> 38
			BEGIN
				SET @MENSAJE_ERROR = 'La solicitud ya no está Ingresada.';
				RETURN -15;
			END

			SELECT @ACTOR_PASO = CORR_ACTOR_ORIGEN
			FROM dbo.SEG_FLUJO_PASO
			WHERE CORR_EMPRESA = @EMPRESA
			  AND CORR_PASO = @CORR_PASO_ACTUAL;

			IF @ACTOR_PASO IS NULL
			   OR ISNULL(dbo.SEG_FN_UsuarioMatchActorUnidad(LTRIM(RTRIM(@LOGIN_SISTEMA)), @ACTOR_PASO, @UNIDAD_DOC, @EMPRESA), 0) <> 1
			BEGIN
				SET @MENSAJE_ERROR = 'El usuario no es el ejecutor del paso actual.';
				RETURN -13;
			END

			SET @ID_ACCION = NULL;
			SELECT TOP 1 @ID_ACCION = CORR_ACCION
			FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
			WHERE CORR_EMPRESA = @EMPRESA
			  AND CORR_PASO = @CORR_PASO_ACTUAL
			  AND CORR_ESTADO_DESTINO = CASE WHEN @OPERACION = 4 THEN 46 ELSE 39 END
			  AND PERMITIDO = 1
			  AND ACTIVO = 1;

			IF @ID_ACCION IS NULL
			BEGIN
				SET @MENSAJE_ERROR = CASE WHEN @OPERACION = 4
					THEN 'El paso actual no tiene una accion de rechazo.'
					ELSE 'El paso actual no tiene una accion de aprobacion.' END;
				RETURN -14;
			END

			SET @CORR_ACCION_USADA = @ID_ACCION;
			SET @MODO = CASE WHEN @OPERACION = 4 THEN 'RECHAZAR' ELSE 'APROBAR' END;
		END
	END
	ELSE IF @ID_INSTANCIA IS NOT NULL
	BEGIN
		SELECT @V_NOMBRE_ESTADO = LEFT(NOMBRE_ESTADO, 100)
		FROM dbo.SEG_FLUJO_ESTADO
		WHERE CORR_EMPRESA = @EMPRESA AND CORR_ESTADO = @CORR_ESTADO;

		SET @NOMBRE_ESTADO = @V_NOMBRE_ESTADO;
		SET @MODO = 'EN_FLUJO';
		SET @MENSAJE_ERROR = 'La solicitud de nuevo ingreso ya fue enviada (instancia activa del tipo 104).';
		RETURN -12;
	END

	IF @OPERACION = 1
		SET @MODO = 'NUEVO';

	IF @UNIDAD_DOC IS NULL
	BEGIN
		SET @MENSAJE_ERROR = CASE WHEN @OPERACION = 1
			THEN 'Al iniciar el flujo (OPERACION=1) debe enviar @CORR_UNIDAD_DOCUMENTO.'
			ELSE 'La instancia no tiene unidad de documento.' END;
		RETURN -8;
	END

	-- =========================================================================
	-- PASO 4 — Motor de flujo (crear instancia + avanzar según config del paso 18)
	-- Cómo: misma llamada que el descriptor tras GUARDAR/ENVIAR.
	--       Acción 1 del paso 18 está configurada como AVANZA → paso 19,
	--       estado destino 38 Ingresado.
	-- =========================================================================
	SET @ERROR_MOTOR = NULL;
	SET @ESTADO_MOTOR = NULL;

	EXEC dbo.EjecutarFlujoProceso
		@i_CORR_EMPRESA = @EMPRESA,
		@i_CODIGO_OPCION = @CODIGO_OPCION,
		@i_idDocumento = @CORR_PROSPECTO,
		@i_idUnidadDocumento = @UNIDAD_DOC,
		@i_idAccion = @ID_ACCION,
		@i_login = @LOGIN_SISTEMA,
		@i_Observacion = @OBSERVACION,
		@o_idEstadoDocumento = @ESTADO_MOTOR OUTPUT,
		@o_Error = @ERROR_MOTOR OUTPUT;

	IF @ERROR_MOTOR IS NOT NULL
	BEGIN
		SET @CORR_ESTADO = @ESTADO_MOTOR;
		SET @MENSAJE_ERROR = @ERROR_MOTOR;
		RETURN -10;
	END

	SET @CORR_ESTADO = @ESTADO_MOTOR;

	SELECT @CORR_PASO_ACTUAL = CORR_PASO_ACTUAL,
	       @CORR_ESTADO = CORR_ESTADO_ACTUAL
	FROM dbo.SEG_FLUJO_INSTANCIA
	WHERE CORR_EMPRESA = @EMPRESA
	  AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
	  AND CORR_DOCUMENTO = @CORR_PROSPECTO
	  AND ACTIVO = 1;

	SELECT @V_NOMBRE_ESTADO = LEFT(NOMBRE_ESTADO, 100)
	FROM dbo.SEG_FLUJO_ESTADO
	WHERE CORR_EMPRESA = @EMPRESA AND CORR_ESTADO = @CORR_ESTADO;

	SET @NOMBRE_ESTADO = @V_NOMBRE_ESTADO;
	SET @MODO = 'EN_FLUJO';

	-- =========================================================================
	-- PASO 5 — Sincronizar ACA_PROSPECTO_ESTADO (tipo 104)
	-- Cómo: la PK incluye CORR_ESTADO; se inserta la fila del estado actual
	--       si aún no existe (el listado V_ACA_PROSPECTO lee el más reciente).
	-- =========================================================================
	IF @CORR_ESTADO IS NOT NULL
	   AND NOT EXISTS (
		SELECT 1
		FROM dbo.ACA_PROSPECTO_ESTADO
		WHERE CORR_EMPRESA = @EMPRESA
		  AND CORR_PROSPECTO = @CORR_PROSPECTO
		  AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
		  AND CORR_ESTADO = @CORR_ESTADO
	)
	BEGIN
		INSERT INTO dbo.ACA_PROSPECTO_ESTADO (
			CORR_EMPRESA,
			CORR_PROSPECTO,
			CORR_TIPO_DOCUMENTO,
			CORR_ESTADO,
			USUARIO_CREA,
			ESTACION_CREA,
			FECHA_CREA
		)
		VALUES (
			@EMPRESA,
			@CORR_PROSPECTO,
			@ID_TIPO_DOCUMENTO,
			@CORR_ESTADO,
			LEFT(@LOGIN_SISTEMA, 50),
			LEFT(@V_ESTACION, 50),
			GETDATE()
		);
	END
	ELSE IF @CORR_ESTADO IS NOT NULL
	BEGIN
		UPDATE dbo.ACA_PROSPECTO_ESTADO
		SET USUARIO_ACTU = LEFT(@LOGIN_SISTEMA, 50),
			ESTACION_ACTU = LEFT(@V_ESTACION, 50),
			FECHA_ACTU = GETDATE()
		WHERE CORR_EMPRESA = @EMPRESA
		  AND CORR_PROSPECTO = @CORR_PROSPECTO
		  AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
		  AND CORR_ESTADO = @CORR_ESTADO;
	END

	-- =========================================================================
	-- PASO 6 — Lock del portal (ACA_PROSPECTO.ESTADO = 'C')
	-- Qué hace: el front de admisiones usa ESTADO='C' como flagCompleted.
	-- =========================================================================
	UPDATE dbo.ACA_PROSPECTO
	SET ESTADO = 'C',
		USUARIO_ACTU = LEFT(@LOGIN_SISTEMA, 50),
		ESTACION_ACTU = LEFT(@V_ESTACION, 50),
		FECHA_ACTU = GETDATE()
	WHERE CORR_PROSPECTO = @CORR_PROSPECTO;

	RETURN 0;
END
GO
