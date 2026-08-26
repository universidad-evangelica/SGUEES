-- =============================================================================
-- Procedimiento: dbo.PRAL_DATA_SC_DESCRIPTOR_PUESTO_ACCIONES_FLUJO
--
-- Qué hace:
--   SOLO CONSULTA. Dice qué botones de flujo puede ver el usuario en pantalla
--   (Solicitar, Aprobar, Observar, Inactivar, Reactivar).
--   No mueve el flujo ni crea notificaciones.
--
-- Nota:
--   No usa SEG_SP_ResolverDestinatariosPaso. Ese procedimiento es del motor
--   cuando se ejecuta una acción (para saber a quién notificar).
--   Este SP es aparte: solo consulta, para encender/apagar botones en pantalla.
--
-- Cómo lo hace:
--   1) Lee el estado del descriptor y el registro activo del flujo.
--   2) Obtiene el actor del paso actual.
--   3) Revisa si el LOGIN es quien debe actuar en ese paso:
--        a) Tiene notificación pendiente (no procesada).
--        b) Está asignado al actor (TH / Jefe TH).
--        c) JI: jefe activo de la unidad PADRE del documento (igual que JEFE_INMEDIATO del motor).
--   4) Une estado + destinatario → Solicitar / Aprobar / Observar.
--   5) Inactivar / Reactivar (paso Vigencia): SOLO si el login cumple el actor
--      del paso con la misma regla del motor (SEG_FN_UsuarioMatchActorUnidad).
--      Así no aparece Reactivar a JI/creador cuando el ejecutor es Jefe de TH.
--
-- Nota permisos:
--   Este SP NO valida CRUDP del menú. La API (GetAccionesFlujo) cruza estos flags
--   con el permiso U del JWT; sin U el usuario queda en solo consulta aunque sea destinatario.
--
-- Nota notificaciones:
--   Quien creó el descriptor puede recibir aviso informativo más adelante;
--   eso NO enciende PUEDE_REACTIVAR / PUEDE_INACTIVAR.
--
-- Uso API: GET SC_DESCRIPTOR_PUESTO/GetAccionesFlujo
-- =============================================================================
CREATE OR ALTER PROCEDURE [dbo].[PRAL_DATA_SC_DESCRIPTOR_PUESTO_ACCIONES_FLUJO]
(
	@CORR_EMPRESA INT = 1,
	@CORR_DESCRIPTOR_PUESTO INT,
	@LOGIN_SISTEMA VARCHAR(30)
)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @Empresa INT = ISNULL(@CORR_EMPRESA, 1);
	DECLARE @Login VARCHAR(30) = LTRIM(RTRIM(ISNULL(@LOGIN_SISTEMA, '')));
	DECLARE @CodOpcion VARCHAR(50) = 'SC_DESCRIPTOR_PUESTO';
	DECLARE @IdTipoDoc INT;
	DECLARE @NombreEstado VARCHAR(100);
	DECLARE @CorrEstado INT;
	DECLARE @UsuarioCrea VARCHAR(30);
	DECLARE @UnidadDescriptor INT;
	DECLARE @IdInstancia INT;
	DECLARE @IdPaso INT;
	DECLARE @NombrePaso VARCHAR(200);
	DECLARE @IdActorOrigen INT;
	DECLARE @UnidadPaso INT;
	DECLARE @UnidadDoc INT;
	DECLARE @UnidadPadre INT;
	DECLARE @UnidadValidacion INT;
	DECLARE @TipoResActor VARCHAR(30);
	DECLARE @EsDestinatario BIT = 0;
	DECLARE @EsEjecutorPaso BIT = 0;
	DECLARE @PuedeSolicitar BIT = 0;
	DECLARE @PuedeAprobar BIT = 0;
	DECLARE @PuedeObservar BIT = 0;
	DECLARE @PuedeInactivar BIT = 0;
	DECLARE @PuedeReactivar BIT = 0;
	DECLARE @EstadoNorm VARCHAR(100);

	IF @CORR_DESCRIPTOR_PUESTO IS NULL OR @CORR_DESCRIPTOR_PUESTO <= 0 OR @Login = ''
	BEGIN
		SELECT
			CAST(0 AS INT) AS CORR_DESCRIPTOR_PUESTO,
			CAST(NULL AS VARCHAR(100)) AS NOMBRE_ESTADO,
			CAST(NULL AS INT) AS CORR_PASO_ACTUAL,
			CAST(NULL AS VARCHAR(200)) AS NOMBRE_PASO,
			CAST(0 AS BIT) AS ES_DESTINATARIO_PASO,
			CAST(0 AS BIT) AS PUEDE_SOLICITAR,
			CAST(0 AS BIT) AS PUEDE_APROBAR,
			CAST(0 AS BIT) AS PUEDE_OBSERVAR,
			CAST(0 AS BIT) AS PUEDE_INACTIVAR,
			CAST(0 AS BIT) AS PUEDE_REACTIVAR;
		RETURN;
	END

	SELECT @IdTipoDoc = CORR_TIPO_DOCUMENTO
	FROM dbo.SEG_FLUJO_TIPO_DOCUMENTO
	WHERE CORR_EMPRESA = @Empresa AND CODIGO_OPCION = @CodOpcion AND ACTIVO = 1;

	SELECT
		@CorrEstado = D.CORR_ESTADO,
		@NombreEstado = D.NOMBRE_ESTADO,
		@UsuarioCrea = D.USUARIO_CREA,
		@UnidadDescriptor = D.CORR_UNIDAD
	FROM dbo.SC_DESCRIPTOR_PUESTO D
	WHERE D.CORR_EMPRESA = @Empresa
	  AND D.CORR_DESCRIPTOR_PUESTO = @CORR_DESCRIPTOR_PUESTO;

	SELECT
		@IdInstancia = I.CORR_INSTANCIA,
		@IdPaso = I.CORR_PASO_ACTUAL,
		@UnidadDoc = I.CORR_UNIDAD_DOCUMENTO
	FROM dbo.SEG_FLUJO_INSTANCIA I
	WHERE I.CORR_EMPRESA = @Empresa
	  AND I.CORR_TIPO_DOCUMENTO = @IdTipoDoc
	  AND I.CORR_DOCUMENTO = @CORR_DESCRIPTOR_PUESTO
	  AND I.ACTIVO = 1;

	IF @IdPaso IS NOT NULL
	BEGIN
		SELECT
			@NombrePaso = P.NOMBRE_PASO,
			@IdActorOrigen = P.CORR_ACTOR_ORIGEN,
			@UnidadPaso = P.CORR_UNIDAD_DESTINO
		FROM dbo.SEG_FLUJO_PASO P
		WHERE P.CORR_EMPRESA = @Empresa
		  AND P.CORR_PASO = @IdPaso;
	END

	-- a) Notificación pendiente del paso actual para este login
	IF @IdInstancia IS NOT NULL
	   AND EXISTS (
			SELECT 1
			FROM dbo.SEG_FLUJO_NOTIFICACION N
			WHERE N.CORR_EMPRESA = @Empresa
			  AND N.CORR_INSTANCIA = @IdInstancia
			  AND N.CORR_PASO = @IdPaso
			  AND N.LOGIN_SISTEMA_DESTINO = @Login
			  AND ISNULL(N.PROCESADO, 0) = 0
	   )
		SET @EsDestinatario = 1;

	-- b) Asignación fija del actor del paso (Analista TH / Jefe TH)
	-- Qué hace: marca destinatario si el login está asignado al actor origen del paso.
	-- Cómo lo hace: exige CORR_ACTOR + LOGIN + ACTIVO; filtra por unidad salvo cuando el
	--   paso tiene CORR_UNIDAD_DESTINO NULL (todos los asignados activos al actor, igual que el motor v9.5).
	IF @EsDestinatario = 0
	   AND @IdActorOrigen IS NOT NULL
	   AND EXISTS (
			SELECT 1
			FROM dbo.SEG_FLUJO_ACTOR_ASIGNACION A
			WHERE A.CORR_EMPRESA = @Empresa
			  AND A.CORR_ACTOR = @IdActorOrigen
			  AND A.LOGIN_SISTEMA = @Login
			  AND A.ACTIVO = 1
			  AND (
					A.CORR_UNIDAD IS NULL
					OR A.CORR_UNIDAD = @UnidadDoc
					OR EXISTS (
						SELECT 1
						FROM dbo.SEG_FLUJO_PASO P2
						WHERE P2.CORR_EMPRESA = @Empresa
						  AND P2.CORR_PASO = @IdPaso
						  AND P2.CORR_UNIDAD_DESTINO = A.CORR_UNIDAD
					)
					OR EXISTS (
						SELECT 1
						FROM dbo.SEG_FLUJO_PASO P2
						WHERE P2.CORR_EMPRESA = @Empresa
						  AND P2.CORR_PASO = @IdPaso
						  AND P2.CORR_UNIDAD_DESTINO IS NULL
					)
			  )
	   )
		SET @EsDestinatario = 1;

	-- c) JI: jefe de la unidad PADRE del documento (misma regla que SEG_SP_ResolverDestinatariosPaso / JEFE_INMEDIATO).
	-- Cómo: Subgerencia (5) → padre Gerencia (3) → solo el jefe de Gerencia (ej. juanh), no el jefe de la Subgerencia.
	IF @EsDestinatario = 0
	   AND @IdActorOrigen = 3
	   AND @UnidadDoc IS NOT NULL
	BEGIN
		SET @UnidadPadre = dbo.SEG_FN_ObtenerUnidadPadre(@UnidadDoc);
		IF @UnidadPadre IS NOT NULL
		   AND EXISTS (
				SELECT 1
				FROM dbo.SEG_FN_ObtenerJefesDeUnidad(@UnidadPadre) J
				WHERE J.LoginDestino = @Login
		   )
			SET @EsDestinatario = 1;
	END;

	-- =============================================================================
	-- Ejecutor del paso (misma regla que EjecutarFlujoProceso / UsuarioMatchActorUnidad)
	-- Qué hace: define quién puede Inactivar/Reactivar (actor Vigencia = Jefe TH).
	-- Cómo: JEFE_* → unidad del documento; MANUAL → unidad del paso (NULL = cualquier asignación).
	-- =============================================================================
	IF @IdActorOrigen IS NOT NULL
	BEGIN
		SET @TipoResActor = dbo.SEG_FN_ObtenerTipoResolucionActor(@Empresa, @IdActorOrigen);

		IF @TipoResActor IN ('JEFE_UNIDAD', 'JEFE_INMEDIATO')
			SET @UnidadValidacion = COALESCE(@UnidadDoc, @UnidadDescriptor);
		ELSE
			SET @UnidadValidacion = @UnidadPaso; -- NULL = cualquier asignación activa del actor (v9.5)

		IF dbo.SEG_FN_UsuarioMatchActorUnidad(
				@Login,
				@IdActorOrigen,
				@UnidadValidacion,
				@Empresa
			) = 1
			SET @EsEjecutorPaso = 1;
	END;

	SET @EstadoNorm = UPPER(LTRIM(RTRIM(ISNULL(@NombreEstado, ''))));

	-- Solicitar: Borrador/Observado; lo usa quien edita (creador o permiso UI).
	-- No exige ser "destinatario JI"; el creador inicia el envío.
	IF @EstadoNorm IN (N'BORRADOR', N'OBSERVADO')
	   AND (
			@UsuarioCrea IS NULL
			OR LTRIM(RTRIM(@UsuarioCrea)) = ''
			OR LTRIM(RTRIM(@UsuarioCrea)) = @Login
			OR @EsDestinatario = 1
	   )
		SET @PuedeSolicitar = 1;

	-- Aprobar / Observar: solo destinatario del paso de autorización
	IF @EstadoNorm IN (N'ENVIADO JI', N'APROBADO JI', N'ENVIADO A JTH') AND @EsDestinatario = 1
	BEGIN
		SET @PuedeAprobar = 1;
		SET @PuedeObservar = 1;
	END

	-- Vigencia: Inactivar/Reactivar solo al ejecutor real del paso (Jefe TH), no al JI/creador.
	IF @EstadoNorm = N'ACTIVO' AND @EsEjecutorPaso = 1
		SET @PuedeInactivar = 1;

	IF @EstadoNorm = N'INACTIVO' AND @EsEjecutorPaso = 1
		SET @PuedeReactivar = 1;

	SELECT
		@CORR_DESCRIPTOR_PUESTO AS CORR_DESCRIPTOR_PUESTO,
		@NombreEstado AS NOMBRE_ESTADO,
		@IdPaso AS CORR_PASO_ACTUAL,
		@NombrePaso AS NOMBRE_PASO,
		@EsDestinatario AS ES_DESTINATARIO_PASO,
		@PuedeSolicitar AS PUEDE_SOLICITAR,
		@PuedeAprobar AS PUEDE_APROBAR,
		@PuedeObservar AS PUEDE_OBSERVAR,
		@PuedeInactivar AS PUEDE_INACTIVAR,
		@PuedeReactivar AS PUEDE_REACTIVAR;
END
GO
