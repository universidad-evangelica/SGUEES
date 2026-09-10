-- ======================================================
-- SCRIPT 3: FUNCIONES Y STORED PROCEDURES
-- Version: 9.7
-- Base de datos: SGUEES
--
-- CAMBIOS v9.7:
--   - CORR_ESTADO_ORIGEN inferido dinamicamente en FASE 2B cuando es NULL:
--     el motor busca la accion AVANZA (TIPO_MOV=1) en SEG_FLUJO_PASO_ACCION_ESTADO
--     cuyo CORR_PASO_DESTINO apunta al paso actual y usa su CORR_ESTADO_DESTINO.
--     Solo aplica a pasos con ORDEN > 1; el paso inicial (ORDEN=1) siempre
--     debe tener CORR_ESTADO_ORIGEN seteado (estado inicial de la instancia).
--     Backward compatible: si CORR_ESTADO_ORIGEN esta seteado, se usa tal cual.
--
-- CAMBIOS v9.6:
--   - CORR_ESTADO_ORIGEN_ALT eliminado del motor: inferido dinamicamente desde
--     SEG_FLUJO_PASO_ACCION_ESTADO. El motor busca si el estado actual es
--     CORR_ESTADO_DESTINO de alguna accion RETORNA (TIPO_MOV=2) cuyo
--     CORR_PASO_DESTINO apunta al paso actual. Soporta N estados de re-entrada
--     automaticamente sin configuracion adicional en SEG_FLUJO_PASO.
--   - CORR_PASO_RETORNO eliminado del motor: RETORNA usa siempre
--     CORR_PASO_DESTINO de SEG_FLUJO_PASO_ACCION_ESTADO. Si es NULL, cae
--     al paso anterior por ORDEN (fallback de compatibilidad). El campo
--     puede dejarse en la tabla de BD sin efecto.
--   - SEG_FLUJO_PASO queda solo con metadata del paso; toda la logica de
--     movimiento y validacion de estados vive en SEG_FLUJO_PASO_ACCION_ESTADO.
--
-- CAMBIOS v9.5:
--   - NULL semantico para actores MANUAL: cuando CORR_UNIDAD es NULL en
--     SEG_FLUJO_PASO_ACTOR_DESTINO o CORR_UNIDAD_DESTINO es NULL en
--     SEG_FLUJO_PASO para actores MANUAL, el motor notifica a TODOS los
--     usuarios asignados a ese actor (sin restriccion de unidad).
--     Permite actores multi-unidad (ej: Directorio ejecutivo con usuarios
--     en unidades 4 y 5) sin necesidad de especificar unidad en la config.
--   - SEG_FN_UsuarioMatchActorUnidad: @i_CORR_UNIDAD=NULL para MANUAL
--     valida si el usuario tiene cualquier asignacion activa para el actor.
--   - SEG_SP_ResolverDestinatariosPaso: unidad NULL para MANUAL devuelve
--     TODOS los usuarios asignados al actor (DISTINCT, sin filtro de unidad).
--   - EjecutarFlujoProceso: validacion de ejecutor MANUAL con NULL unidad
--     acepta cualquier asignacion activa; PAD con NULL unidad notifica a todos.
--   - SEG_FN_InferirUnidadActor: conservada pero ya no se usa en validaciones
--     ni resoluciones de destinatarios; solo en calculos de metadata de unidad.
--
-- CAMBIOS v9.4:
--   - Fix semantico: CORR_UNIDAD_DESTINO del paso actual se pasa como
--     CORR_UNIDAD_OVERRIDE al resolver en bloques SIGUIENTE (FASE 2A y 2B).
--     Esto alinea el campo con su nombre: la unidad es del ACTOR DESTINO del
--     paso, no del origen. Si CORR_UNIDAD_DESTINO es NULL, el resolver usa su
--     fallback normal (unidad del documento para Jefe, sin restriccion para MANUAL).
--     Backward compatible: flujos existentes con CORR_UNIDAD_DESTINO=NULL
--     no cambian de comportamiento.
--
-- CAMBIOS v9.3:
--   - Nueva funcion SEG_FN_InferirUnidadActor: infiere la unidad de un actor
--     MANUAL desde SEG_FLUJO_ACTOR_ASIGNACION cuando esta en una sola unidad.
--   - CORR_UNIDAD_DESTINO ya no es obligatorio en SEG_FLUJO_PASO para actores
--     de tipo MANUAL (Analista TH, etc.). Si es NULL, el motor infiere la unidad
--     automaticamente. Si el actor tiene asignaciones en varias unidades, cae
--     al documento como antes (backward compatible).
--   - Cambios en: SEG_SP_ResolverDestinatariosPaso, EjecutarFlujoProceso
--     (validacion de ejecutor y calculo de unidad para notificaciones).
--
-- RESUMEN v9.2:
--   Motor completamente data-driven. Comportamiento configurado en
--   SEG_FLUJO_PASO_ACCION_ESTADO, permitiendo crear flujos nuevos
--   (101, 102, etc.) desde interfaz sin tocar código.
--
-- CAMBIOS v9.2:
--   - @i_CODIGO_OPCION: resuelve tipo de documento automáticamente
--   - Documentación mejorada de parámetros (especialmente @i_idUnidadDocumento)
--   - Reglas de implementación clarificadas
--
-- CAMBIOS v9.1:
--   - SIN IDENTITY: MAX+1 por empresa en tablas transaccionales
--   - FASE 2A solo para CORR_ACCION=1 (hardcodeado para flujo 100)
--   - MANTIENE (4) soporta múltiples ciclos (p.ej. ESPERA)
--   - Jefes vencidos sincronizados en PRE-FASE
--
-- CAMBIOS v9.0:
--   - Data-driven: TIPO_MOVIMIENTO y TIPO_NOTIFICACION en tabla
--   - Eliminada lógica hardcodeada por acción
--   - Mensajes por ESTADO (SEG_FLUJO_ESTADO_MENSAJE)
--
-- TIPO_MOVIMIENTO (CORR_TIPO_MOVIMIENTO):
--   1=AVANZA: paso indicado en CORR_PASO_DESTINO (o siguiente por ORDEN)
--   2=RETORNA: paso indicado en CORR_PASO_DESTINO (o paso anterior por ORDEN)
--   3=FINALIZA: cierra instancia (ACTIVO=0)
--   4=MANTIENE: mismo paso, solo cambia estado (útil para ESPERA)
--   5=ANTERIOR: paso anterior por ORDEN
--
-- TIPO_NOTIFICACION (CORR_TIPO_NOTIFICACION):
--   1=ACTUAL: destinatarios del paso actual (destino principal + multi-actor)
--   2=SIGUIENTE: destinatarios del paso nuevo
--   3=CREADOR: solo creador del documento
--   4=ANTERIOR: destinatarios del paso anterior
--   5=NO NOTIFICA: no se genera ninguna notificacion
--
-- REGLAS IMPLEMENTACIÓN:
-- - SIN IDENTITY: MAX+1 por CORR_EMPRESA en tablas transaccionales
-- - Data-driven: comportamiento 100% desde SEG_FLUJO_PASO_ACCION_ESTADO
-- - TIPO_MOVIMIENTO: controla flujo del documento (qué paso es siguiente)
-- - TIPO_NOTIFICACION: controla a quién se notifica
-- - MANTIENE (4): permite múltiples ciclos en el mismo paso (p.ej. ESPERA)
-- - Jefes vencidos: sincronizados en PRE-FASE (FECHA_FIN < HOY -> ACTIVO=0)
-- - Unidad de documento: inmutable tras primera ejecución (trazabilidad)
-- - Parámetro @i_idUnidadDocumento: destino de notificación en ejecuciones posteriores
-- ======================================================

USE SGUEES;
GO

-- ======================================================
-- FN 1: Login por CORR_EMPLEADO
-- ======================================================
CREATE OR ALTER FUNCTION dbo.SEG_FN_ObtenerLoginPorCodigoEmpleado
(
    @CORR_EMPLEADO INT
)
RETURNS VARCHAR(30)
AS
BEGIN
    DECLARE @Login VARCHAR(30);

    SELECT @Login = LOGIN_SISTEMA_WEB
    FROM dbo.GEN_EMPLEADO
    WHERE CORR_EMPLEADO   = @CORR_EMPLEADO
      AND ESTADO_EMPLEADO = '1';

    RETURN @Login;
END
GO

-- ======================================================
-- FN 2: Jefe activo de una unidad (titular/interino más reciente)
-- Retorna: LOGIN_SISTEMA_WEB del primer jefe (ordenado por FECHA_INICIO DESC)
--          con ACTIVO=1 y (FECHA_FIN IS NULL OR FECHA_FIN >= HOY)
-- ======================================================
CREATE OR ALTER FUNCTION dbo.SEG_FN_ObtenerJefeDeUnidad
(
    @CORR_UNIDAD INT
)
RETURNS VARCHAR(30)
AS
BEGIN
    DECLARE @Login VARCHAR(30);

    SELECT TOP 1 @Login = GE.LOGIN_SISTEMA_WEB
    FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES J
    INNER JOIN dbo.GEN_EMPLEADO GE ON GE.CORR_EMPLEADO = J.CORR_EMPLEADO
    WHERE J.CORR_UNIDAD   = @CORR_UNIDAD
      AND J.ACTIVO        = 1
      AND (J.FECHA_FIN IS NULL OR J.FECHA_FIN >= CAST(GETDATE() AS DATE))
      AND GE.ESTADO_EMPLEADO    = '1'
      AND GE.LOGIN_SISTEMA_WEB IS NOT NULL
    ORDER BY J.FECHA_INICIO DESC;

    RETURN @Login;
END
GO

-- ======================================================
-- FN 3: Unidad padre
-- ======================================================
CREATE OR ALTER FUNCTION dbo.SEG_FN_ObtenerUnidadPadre
(
    @CORR_UNIDAD INT
)
RETURNS INT
AS
BEGIN
    DECLARE @UnidadPadre INT;

    SELECT @UnidadPadre = CORR_UNIDAD_PADRE
    FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES
    WHERE CORR_UNIDAD = @CORR_UNIDAD;

    RETURN @UnidadPadre;
END
GO

-- ======================================================
-- FN 4: TVF - Todos los jefes activos de una unidad
-- Retorna: TABLE con LOGIN_SISTEMA_WEB de jefes activos
--          (mismo filtro ACTIVO=1 y FECHA_FIN que FN 2)
-- Usado para multi-actor: notificar a todos los jefes simultáneamente
-- ======================================================
CREATE OR ALTER FUNCTION dbo.SEG_FN_ObtenerJefesDeUnidad
(
    @CORR_UNIDAD INT
)
RETURNS TABLE
AS
RETURN
(
    SELECT GE.LOGIN_SISTEMA_WEB AS LoginDestino
    FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES J
    INNER JOIN dbo.GEN_EMPLEADO GE ON GE.CORR_EMPLEADO = J.CORR_EMPLEADO
    WHERE J.CORR_UNIDAD      = @CORR_UNIDAD
      AND J.ACTIVO           = 1
      AND (J.FECHA_FIN IS NULL OR J.FECHA_FIN >= CAST(GETDATE() AS DATE))
      AND GE.ESTADO_EMPLEADO    = '1'
      AND GE.LOGIN_SISTEMA_WEB IS NOT NULL
);
GO

-- ======================================================
-- FN 5: Infiere estrategia de resolución de un actor
-- Retorna: 'MANUAL' | 'JEFE_UNIDAD' | 'JEFE_INMEDIATO'
-- Basado en NOMBRE_ACTOR y REQUIERE_UNIDAD de SEG_FLUJO_ACTOR.
-- Mapeo seguro por nombre: "Jefe de Unidad", "Jefe Inmediato", etc.
-- ======================================================
CREATE OR ALTER FUNCTION dbo.SEG_FN_ObtenerTipoResolucionActor
(
    @i_CORR_EMPRESA INT,
    @i_CORR_ACTOR   INT
)
RETURNS VARCHAR(30)
AS
BEGIN
    DECLARE @NombreActor    VARCHAR(100);
    DECLARE @RequiereUnidad BIT;
    DECLARE @TipoResolucion VARCHAR(30);

    SELECT @NombreActor    = NOMBRE_ACTOR,
           @RequiereUnidad = REQUIERE_UNIDAD
    FROM dbo.SEG_FLUJO_ACTOR
    WHERE CORR_EMPRESA = @i_CORR_EMPRESA
      AND CORR_ACTOR   = @i_CORR_ACTOR;

    IF @NombreActor IS NULL RETURN NULL;

    SET @TipoResolucion =
        CASE
            WHEN @RequiereUnidad = 0             THEN 'MANUAL'
            WHEN @NombreActor = 'Jefe de Unidad'  THEN 'JEFE_UNIDAD'
            WHEN @NombreActor = 'Jefe Inmediato'   THEN 'JEFE_INMEDIATO'
            ELSE 'MANUAL'
        END;

    RETURN @TipoResolucion;
END
GO

-- ======================================================
-- FN 6: Valida si usuario satisface un actor en una unidad
-- Retorna: 1 (cumple) | 0 (no cumple o no existe)
-- Verifica: usuario activo en SEG_USUARIO + resolución de actor
--           según tipo (MANUAL, JEFE_UNIDAD, JEFE_INMEDIATO)
-- ======================================================
CREATE OR ALTER FUNCTION dbo.SEG_FN_UsuarioMatchActorUnidad
(
    @i_LOGIN_SISTEMA VARCHAR(30),
    @i_CORR_ACTOR    INT,
    @i_CORR_UNIDAD   INT,
    @i_CORR_EMPRESA  INT
)
RETURNS BIT
AS
BEGIN
    DECLARE @Resultado BIT = 0;
    DECLARE @TipoResolucion VARCHAR(30);
    DECLARE @RequiereUnidad BIT;
    DECLARE @UnidadPadre INT;

    SELECT @RequiereUnidad = REQUIERE_UNIDAD
    FROM dbo.SEG_FLUJO_ACTOR
    WHERE CORR_EMPRESA = @i_CORR_EMPRESA
      AND CORR_ACTOR   = @i_CORR_ACTOR;

    IF @RequiereUnidad IS NULL RETURN 0;

    SET @TipoResolucion = dbo.SEG_FN_ObtenerTipoResolucionActor(@i_CORR_EMPRESA, @i_CORR_ACTOR);

    -- Verificar que el usuario este activo
    IF NOT EXISTS (
        SELECT 1 FROM dbo.SEG_USUARIO
        WHERE LOGIN_SISTEMA = @i_LOGIN_SISTEMA AND ESTADO_USUARIO = 1
    )
        RETURN 0;

    -- Actor sin unidad: cualquier usuario activo cumple
    IF @RequiereUnidad = 0
        RETURN 1;

    IF @TipoResolucion IN ('MANUAL', 'USUARIO_ESPECIFICO')
    BEGIN
        IF @i_CORR_UNIDAD IS NOT NULL
        BEGIN
            -- Con unidad especifica: verifica asignacion en esa unidad
            IF EXISTS (
                SELECT 1 FROM dbo.SEG_FLUJO_ACTOR_ASIGNACION
                WHERE CORR_EMPRESA  = @i_CORR_EMPRESA
                  AND LOGIN_SISTEMA = @i_LOGIN_SISTEMA
                  AND CORR_ACTOR    = @i_CORR_ACTOR
                  AND CORR_UNIDAD   = @i_CORR_UNIDAD
                  AND ACTIVO        = 1
            )
                SET @Resultado = 1;
        END
        ELSE
        BEGIN
            -- v9.5: NULL = sin restriccion de unidad; cualquier asignacion activa del actor
            IF EXISTS (
                SELECT 1 FROM dbo.SEG_FLUJO_ACTOR_ASIGNACION
                WHERE CORR_EMPRESA  = @i_CORR_EMPRESA
                  AND LOGIN_SISTEMA = @i_LOGIN_SISTEMA
                  AND CORR_ACTOR    = @i_CORR_ACTOR
                  AND ACTIVO        = 1
            )
                SET @Resultado = 1;
        END
    END
    ELSE IF @TipoResolucion = 'JEFE_UNIDAD'
    BEGIN
        IF EXISTS (
            SELECT 1 FROM dbo.SEG_FN_ObtenerJefesDeUnidad(@i_CORR_UNIDAD)
            WHERE LoginDestino = @i_LOGIN_SISTEMA
        )
            SET @Resultado = 1;
    END
    ELSE IF @TipoResolucion = 'JEFE_INMEDIATO'
    BEGIN
        SET @UnidadPadre = dbo.SEG_FN_ObtenerUnidadPadre(@i_CORR_UNIDAD);
        IF @UnidadPadre IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM dbo.SEG_FN_ObtenerJefesDeUnidad(@UnidadPadre)
                WHERE LoginDestino = @i_LOGIN_SISTEMA
            )
            SET @Resultado = 1;
    END

    RETURN @Resultado;
END
GO

-- ======================================================
-- FN 7 (v8.0+): Resolver mensaje de notificacion por 4 capas.
-- Consulta SEG_FLUJO_ESTADO_MENSAJE por (paso, estado, actor, login).
-- Sin cambios desde v8.0.
-- ======================================================
CREATE OR ALTER FUNCTION dbo.SEG_FN_ResolverMensajeNotificacion
(
    @CORR_EMPRESA  INT,
    @CORR_PASO     INT,
    @CORR_ESTADO   INT,
    @CORR_ACTOR    INT,
    @LOGIN_SISTEMA VARCHAR(50)
)
RETURNS NVARCHAR(500)
AS
BEGIN
    DECLARE @Mensaje NVARCHAR(500);

    IF @CORR_ACTOR IS NOT NULL AND @LOGIN_SISTEMA IS NOT NULL
        SELECT TOP 1 @Mensaje = MENSAJE
        FROM dbo.SEG_FLUJO_ESTADO_MENSAJE
        WHERE CORR_EMPRESA   = @CORR_EMPRESA
          AND CORR_PASO      = @CORR_PASO
          AND CORR_ESTADO    = @CORR_ESTADO
          AND CORR_ACTOR     = @CORR_ACTOR
          AND LOGIN_SISTEMA  = @LOGIN_SISTEMA
          AND ACTIVO         = 1;

    IF @Mensaje IS NULL AND @LOGIN_SISTEMA IS NOT NULL
        SELECT TOP 1 @Mensaje = MENSAJE
        FROM dbo.SEG_FLUJO_ESTADO_MENSAJE
        WHERE CORR_EMPRESA   = @CORR_EMPRESA
          AND CORR_PASO      = @CORR_PASO
          AND CORR_ESTADO    = @CORR_ESTADO
          AND CORR_ACTOR     IS NULL
          AND LOGIN_SISTEMA  = @LOGIN_SISTEMA
          AND ACTIVO         = 1;

    IF @Mensaje IS NULL AND @CORR_ACTOR IS NOT NULL
        SELECT TOP 1 @Mensaje = MENSAJE
        FROM dbo.SEG_FLUJO_ESTADO_MENSAJE
        WHERE CORR_EMPRESA   = @CORR_EMPRESA
          AND CORR_PASO      = @CORR_PASO
          AND CORR_ESTADO    = @CORR_ESTADO
          AND CORR_ACTOR     = @CORR_ACTOR
          AND LOGIN_SISTEMA  IS NULL
          AND ACTIVO         = 1;

    IF @Mensaje IS NULL
        SELECT TOP 1 @Mensaje = MENSAJE
        FROM dbo.SEG_FLUJO_ESTADO_MENSAJE
        WHERE CORR_EMPRESA   = @CORR_EMPRESA
          AND CORR_PASO      = @CORR_PASO
          AND CORR_ESTADO    = @CORR_ESTADO
          AND CORR_ACTOR     IS NULL
          AND LOGIN_SISTEMA  IS NULL
          AND ACTIVO         = 1;

    RETURN @Mensaje;
END
GO

-- ======================================================
-- FN 8 (v9.3): Infiere la unidad de un actor MANUAL desde sus asignaciones.
-- Retorna: CORR_UNIDAD si el actor tiene asignaciones en exactamente 1 unidad.
-- Retorna: NULL si tiene 0 unidades (sin asignar) o multiples (ambiguo).
-- Uso: reemplaza CORR_UNIDAD_DESTINO cuando este es NULL en el paso.
-- ======================================================
CREATE OR ALTER FUNCTION dbo.SEG_FN_InferirUnidadActor
(
    @CORR_EMPRESA INT,
    @CORR_ACTOR   INT
)
RETURNS INT
AS
BEGIN
    DECLARE @Unidad INT = NULL;
    DECLARE @Cnt    INT;

    SELECT @Cnt = COUNT(DISTINCT CORR_UNIDAD)
    FROM dbo.SEG_FLUJO_ACTOR_ASIGNACION
    WHERE CORR_EMPRESA = @CORR_EMPRESA
      AND CORR_ACTOR   = @CORR_ACTOR
      AND ACTIVO       = 1;

    -- Solo infiere cuando hay exactamente 1 unidad (sin ambiguedad)
    IF @Cnt = 1
        SELECT @Unidad = MIN(CORR_UNIDAD)
        FROM dbo.SEG_FLUJO_ACTOR_ASIGNACION
        WHERE CORR_EMPRESA = @CORR_EMPRESA
          AND CORR_ACTOR   = @CORR_ACTOR
          AND ACTIVO       = 1;

    RETURN @Unidad;  -- NULL si 0 o multiples unidades (el caller decide el fallback)
END
GO

-- ======================================================
-- SP: Resolver destinatarios para un paso
-- v9.3: cuando CORR_UNIDAD_DESTINO es NULL en el paso y el actor
--        es MANUAL, infiere la unidad desde SEG_FLUJO_ACTOR_ASIGNACION
--        via SEG_FN_InferirUnidadActor. Backward compatible: si
--        CORR_UNIDAD_DESTINO esta seteado, lo usa igual que antes.
-- ======================================================
CREATE OR ALTER PROCEDURE dbo.SEG_SP_ResolverDestinatariosPaso
    @CORR_EMPRESA         INT,
    @CORR_PASO            INT,
    @UnidadDocumento      INT,
    @LoginEjecutor        VARCHAR(30) = NULL,
    @CORR_ACTOR_OVERRIDE  INT         = NULL,
    @CORR_UNIDAD_OVERRIDE INT         = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ActorDestino   INT;
    DECLARE @TipoResolucion VARCHAR(30);
    DECLARE @RequiereUnidad BIT;
    DECLARE @UnidadDestino  INT;
    DECLARE @UnidadPadre    INT;
    DECLARE @UnidadPaso     INT;

    -- Cargar datos del actor (override o titular del paso)
    IF @CORR_ACTOR_OVERRIDE IS NOT NULL
    BEGIN
        SELECT @ActorDestino   = A.CORR_ACTOR,
               @RequiereUnidad = A.REQUIERE_UNIDAD
        FROM dbo.SEG_FLUJO_ACTOR A
        WHERE A.CORR_EMPRESA = @CORR_EMPRESA
          AND A.CORR_ACTOR   = @CORR_ACTOR_OVERRIDE;
    END
    ELSE
    BEGIN
        SELECT @ActorDestino   = P.CORR_ACTOR_ORIGEN,
               @RequiereUnidad = A.REQUIERE_UNIDAD
        FROM dbo.SEG_FLUJO_PASO P
        INNER JOIN dbo.SEG_FLUJO_ACTOR A
            ON  A.CORR_EMPRESA = P.CORR_EMPRESA
            AND A.CORR_ACTOR   = P.CORR_ACTOR_ORIGEN
        WHERE P.CORR_EMPRESA = @CORR_EMPRESA
          AND P.CORR_PASO    = @CORR_PASO;
    END

    IF @ActorDestino IS NULL RETURN;

    SET @TipoResolucion = dbo.SEG_FN_ObtenerTipoResolucionActor(@CORR_EMPRESA, @ActorDestino);

    SELECT @UnidadPaso = CORR_UNIDAD_DESTINO
    FROM dbo.SEG_FLUJO_PASO
    WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PASO = @CORR_PASO;

    IF @CORR_UNIDAD_OVERRIDE IS NOT NULL
        SET @UnidadDestino = @CORR_UNIDAD_OVERRIDE;
    ELSE IF @TipoResolucion IN ('JEFE_UNIDAD', 'JEFE_INMEDIATO')
        SET @UnidadDestino = @UnidadDocumento;
    ELSE
    BEGIN
        -- MANUAL: usa unidad configurada; NULL = todos los asignados al actor (v9.5)
        IF @UnidadPaso IS NOT NULL
            SET @UnidadDestino = @UnidadPaso;
        -- Si @UnidadDestino queda NULL: la query devuelve todos los usuarios del actor
    END

    IF @RequiereUnidad = 0
    BEGIN
        IF @LoginEjecutor IS NOT NULL
            SELECT @LoginEjecutor AS LoginDestino;
        RETURN;
    END

    IF @TipoResolucion IN ('MANUAL', 'USUARIO_ESPECIFICO')
    BEGIN
        IF @UnidadDestino IS NOT NULL
            -- Con unidad especifica: filtra por unidad
            SELECT A.LOGIN_SISTEMA AS LoginDestino
            FROM dbo.SEG_FLUJO_ACTOR_ASIGNACION A
            INNER JOIN dbo.SEG_USUARIO U ON U.LOGIN_SISTEMA = A.LOGIN_SISTEMA
            WHERE A.CORR_EMPRESA = @CORR_EMPRESA
              AND A.CORR_ACTOR   = @ActorDestino
              AND A.CORR_UNIDAD  = @UnidadDestino
              AND A.ACTIVO       = 1
              AND U.ESTADO_USUARIO = 1;
        ELSE
            -- v9.5: sin unidad = todos los usuarios asignados al actor (cualquier unidad)
            SELECT DISTINCT A.LOGIN_SISTEMA AS LoginDestino
            FROM dbo.SEG_FLUJO_ACTOR_ASIGNACION A
            INNER JOIN dbo.SEG_USUARIO U ON U.LOGIN_SISTEMA = A.LOGIN_SISTEMA
            WHERE A.CORR_EMPRESA = @CORR_EMPRESA
              AND A.CORR_ACTOR   = @ActorDestino
              AND A.ACTIVO       = 1
              AND U.ESTADO_USUARIO = 1;
    END
    ELSE IF @TipoResolucion = 'JEFE_UNIDAD'
    BEGIN
        SELECT LoginDestino
        FROM dbo.SEG_FN_ObtenerJefesDeUnidad(@UnidadDestino)
        WHERE LoginDestino IS NOT NULL;
    END
    ELSE IF @TipoResolucion = 'JEFE_INMEDIATO'
    BEGIN
        SET @UnidadPadre = dbo.SEG_FN_ObtenerUnidadPadre(@UnidadDestino);
        IF @UnidadPadre IS NOT NULL
        BEGIN
            SELECT LoginDestino
            FROM dbo.SEG_FN_ObtenerJefesDeUnidad(@UnidadPadre)
            WHERE LoginDestino IS NOT NULL;
        END
    END
END
GO

-- ======================================================
-- SP: GenerarNotificacionesFlujo
-- v9.1: reemplaza OUTPUT INSERTED (requeria IDENTITY) por MAX+1 por empresa.
-- ======================================================
CREATE OR ALTER PROCEDURE dbo.GenerarNotificacionesFlujo
    @i_CORR_EMPRESA          INT = 1,
    @i_CORR_TIPO_DOCUMENTO   INT = NULL,
    @i_CORR_DOCUMENTO        INT = NULL,
    @i_CORR_INSTANCIA        INT = NULL,
    @i_CORR_PASO             INT = NULL,
    @i_CORR_ACTOR_DESTINO    INT,
    @i_CORR_UNIDAD           INT,
    @i_MENSAJE               NVARCHAR(500),
    @i_LOGIN_USUARIO_DESTINO VARCHAR(30) = NULL,
    @i_LOGIN_EJECUTOR        VARCHAR(30),
    @i_LOGIN_SISTEMA_ORIGEN  VARCHAR(30) = NULL,
    @i_CORR_ESTADO           INT = NULL,
    @i_CORR_PASO_EJECUTOR    INT = NULL,
    @o_CORR_NOTIFICACION     INT OUTPUT,
    @o_ERROR                 VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @EmpresaEf           INT;
    DECLARE @LoginEjecutorMsg    VARCHAR(30);
    DECLARE @MensajeFinal        NVARCHAR(500);
    DECLARE @PasoResolucion      INT;
    DECLARE @NextCorrNotif       INT;   -- v9.1: MAX+1 para CORR_NOTIFICACION (sin IDENTITY)
    DECLARE @NotifCount          INT;
    -- Tabla temporal para acumular IDs generados (usada por la rama multi-usuario)
    DECLARE @Notificaciones      TABLE (CORR_NOTIFICACION INT);

    SET @PasoResolucion = @i_CORR_PASO_EJECUTOR;
    IF @PasoResolucion IS NULL SET @PasoResolucion = @i_CORR_PASO;

    SET @EmpresaEf = @i_CORR_EMPRESA;
    IF @EmpresaEf IS NULL SET @EmpresaEf = 1;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.SEG_FLUJO_ACTOR
        WHERE CORR_EMPRESA = @EmpresaEf AND CORR_ACTOR = @i_CORR_ACTOR_DESTINO
    )
    BEGIN
        SET @o_ERROR = 'Actor destino no existe: ' + CAST(@i_CORR_ACTOR_DESTINO AS VARCHAR);
        RETURN -1;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.VW_SEG_FLUJO_UNIDAD WHERE CORR_UNIDAD = @i_CORR_UNIDAD)
    BEGIN
        SET @o_ERROR = 'Unidad destino no existe en organigrama: ' + CAST(@i_CORR_UNIDAD AS VARCHAR);
        RETURN -2;
    END

    IF NOT EXISTS (
        SELECT 1 FROM dbo.SEG_USUARIO
        WHERE LOGIN_SISTEMA = @i_LOGIN_EJECUTOR AND ESTADO_USUARIO = 1
    )
    BEGIN
        SET @LoginEjecutorMsg = @i_LOGIN_EJECUTOR;
        IF @LoginEjecutorMsg IS NULL SET @LoginEjecutorMsg = 'NULL';
        SET @o_ERROR = 'Ejecutor no valido o inactivo: ' + @LoginEjecutorMsg;
        RETURN -3;
    END

    IF @i_CORR_INSTANCIA IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM dbo.SEG_FLUJO_INSTANCIA
        WHERE CORR_EMPRESA = @EmpresaEf AND CORR_INSTANCIA = @i_CORR_INSTANCIA
    )
    BEGIN
        SET @o_ERROR = 'Instancia de flujo no existe: ' + CAST(@i_CORR_INSTANCIA AS VARCHAR);
        RETURN -4;
    END

    IF @i_CORR_PASO IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM dbo.SEG_FLUJO_PASO
        WHERE CORR_EMPRESA = @EmpresaEf AND CORR_PASO = @i_CORR_PASO
    )
    BEGIN
        SET @o_ERROR = 'Paso de flujo no existe: ' + CAST(@i_CORR_PASO AS VARCHAR);
        RETURN -7;
    END

    IF @i_LOGIN_USUARIO_DESTINO IS NOT NULL
    BEGIN
        -- Rama de destino directo: un solo registro
        IF @i_CORR_ESTADO IS NOT NULL AND @PasoResolucion IS NOT NULL
            SET @MensajeFinal = dbo.SEG_FN_ResolverMensajeNotificacion(
                @EmpresaEf,
                @PasoResolucion,
                @i_CORR_ESTADO,
                @i_CORR_ACTOR_DESTINO,
                @i_LOGIN_USUARIO_DESTINO);

        IF @MensajeFinal IS NULL SET @MensajeFinal = @i_MENSAJE;
        IF @MensajeFinal IS NULL SET @MensajeFinal = N'Tarea pendiente en el flujo.';

        -- v9.1: calcular CORR_NOTIFICACION con MAX+1 (sin IDENTITY)
        SELECT @NextCorrNotif = ISNULL(MAX(CORR_NOTIFICACION), 0) + 1
        FROM dbo.SEG_FLUJO_NOTIFICACION
        WHERE CORR_EMPRESA = @EmpresaEf;

        INSERT INTO dbo.SEG_FLUJO_NOTIFICACION (
            CORR_EMPRESA, CORR_NOTIFICACION, CORR_INSTANCIA, CORR_PASO,
            LOGIN_SISTEMA_DESTINO, LOGIN_SISTEMA_ORIGEN,
            MENSAJE, URL,
            LEIDA, PROCESADO, FECHA_ENVIO,
            USUARIO_CREA, ESTACION_CREA
        )
        VALUES (
            @EmpresaEf, @NextCorrNotif, @i_CORR_INSTANCIA, @i_CORR_PASO,
            @i_LOGIN_USUARIO_DESTINO, @i_LOGIN_SISTEMA_ORIGEN,
            @MensajeFinal, NULL,
            0, 0, GETDATE(),
            @i_LOGIN_EJECUTOR, 'SP_GenerarNotificaciones'
        );

        INSERT INTO @Notificaciones (CORR_NOTIFICACION) VALUES (@NextCorrNotif);
    END
    ELSE
    BEGIN
        -- Rama multi-usuario: iterar sobre los usuarios asignados al actor/unidad
        -- v9.1: se inserta de a uno con MAX+1 en vez de INSERT-SELECT con OUTPUT
        DECLARE @DestLogin    VARCHAR(30);
        DECLARE @MensajeCalc  NVARCHAR(500);

        DECLARE dest_cursor CURSOR FAST_FORWARD FOR
            SELECT DISTINCT U.LOGIN_SISTEMA
            FROM dbo.SEG_USUARIO U
            INNER JOIN dbo.SEG_FLUJO_ACTOR_ASIGNACION ASA ON U.LOGIN_SISTEMA = ASA.LOGIN_SISTEMA
            WHERE ASA.CORR_EMPRESA  = @EmpresaEf
              AND ASA.CORR_ACTOR    = @i_CORR_ACTOR_DESTINO
              AND ASA.CORR_UNIDAD   = @i_CORR_UNIDAD
              AND ASA.ACTIVO        = 1
              AND U.ESTADO_USUARIO  = 1;

        OPEN dest_cursor;
        FETCH NEXT FROM dest_cursor INTO @DestLogin;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @MensajeCalc = NULL;
            IF @i_CORR_ESTADO IS NOT NULL AND @PasoResolucion IS NOT NULL
                SET @MensajeCalc = dbo.SEG_FN_ResolverMensajeNotificacion(
                    @EmpresaEf, @PasoResolucion, @i_CORR_ESTADO,
                    @i_CORR_ACTOR_DESTINO, @DestLogin);

            IF @MensajeCalc IS NULL SET @MensajeCalc = @i_MENSAJE;
            IF @MensajeCalc IS NULL SET @MensajeCalc = N'Tarea pendiente en el flujo.';

            -- v9.1: MAX+1 por empresa para cada notificacion
            SELECT @NextCorrNotif = ISNULL(MAX(CORR_NOTIFICACION), 0) + 1
            FROM dbo.SEG_FLUJO_NOTIFICACION
            WHERE CORR_EMPRESA = @EmpresaEf;

            INSERT INTO dbo.SEG_FLUJO_NOTIFICACION (
                CORR_EMPRESA, CORR_NOTIFICACION, CORR_INSTANCIA, CORR_PASO,
                LOGIN_SISTEMA_DESTINO, LOGIN_SISTEMA_ORIGEN,
                MENSAJE, URL,
                LEIDA, PROCESADO, FECHA_ENVIO,
                USUARIO_CREA, ESTACION_CREA
            )
            VALUES (
                @EmpresaEf, @NextCorrNotif, @i_CORR_INSTANCIA, @i_CORR_PASO,
                @DestLogin, @i_LOGIN_SISTEMA_ORIGEN,
                @MensajeCalc, NULL,
                0, 0, GETDATE(),
                @i_LOGIN_EJECUTOR, 'SP_GenerarNotificaciones'
            );

            INSERT INTO @Notificaciones (CORR_NOTIFICACION) VALUES (@NextCorrNotif);

            FETCH NEXT FROM dest_cursor INTO @DestLogin;
        END
        CLOSE dest_cursor;
        DEALLOCATE dest_cursor;
    END

    SELECT @NotifCount = COUNT(*) FROM @Notificaciones;
    IF @NotifCount = 0
    BEGIN
        SET @o_ERROR = 'No se generaron notificaciones para actor='
                     + CAST(@i_CORR_ACTOR_DESTINO AS VARCHAR)
                     + ' unidad=' + CAST(@i_CORR_UNIDAD AS VARCHAR);
        RETURN -6;
    END

    SELECT @o_CORR_NOTIFICACION = MAX(CORR_NOTIFICACION) FROM @Notificaciones;
    SET @o_ERROR = NULL;
    RETURN 0;
END
GO


-- ======================================================
-- SP: EjecutarFlujoProceso v9.2
--
-- Motor de flujos completamente data-driven. Comportamiento
-- (movimiento de pasos y notificaciones) viene 100% de
-- SEG_FLUJO_PASO_ACCION_ESTADO, no de código hardcodeado.
--
-- PARÁMETROS:
--   @i_CODIGO_OPCION: código del tipo de documento (v9.2: resuelve
--                     CORR_TIPO_DOCUMENTO y CORR_FLUJO_PROCESO internamente)
--   @i_idUnidadDocumento: DUAL PROPÓSITO
--       PRIMERA EJECUCIÓN: unidad de origen del documento (se guarda en
--                          CORR_UNIDAD_DOCUMENTO de INSTANCIA, INMUTABLE)
--       EJECUCIONES POSTERIORES: unidad DESTINO de notificación para ESTE paso
--                                (si es diferente, toma este valor; si es NULL,
--                                 usa CORR_UNIDAD_DOCUMENTO del documento)
--
-- MOVIMIENTOS (CORR_TIPO_MOVIMIENTO):
--   1=AVANZA: avanza a CORR_PASO_DESTINO (o siguiente si NULL)
--   2=RETORNA: va a CORR_PASO_DESTINO (o paso anterior por ORDEN si NULL)
--   3=FINALIZA: cierra instancia (ACTIVO=0)
--   4=MANTIENE: paso actual sin cambio, solo estado
--   5=ANTERIOR: paso anterior por ORDEN
--
-- NOTIFICACIONES (CORR_TIPO_NOTIFICACION):
--   1=ACTUAL: destinatarios del paso actual (útil para MANTIENE/ESPERA)
--   2=SIGUIENTE: destinatarios del paso nuevo (típico APROBAR)
--   3=CREADOR: solo el creador del documento
--   4=ANTERIOR: destinatarios del paso anterior
--   5=NO NOTIFICA: no se genera ninguna notificacion (accion silenciosa)
-- ======================================================
CREATE OR ALTER PROCEDURE dbo.EjecutarFlujoProceso
    @i_CORR_EMPRESA          INT = 1,
    @i_CODIGO_OPCION         VARCHAR(50),
    @i_idDocumento           INT,
    @i_idUnidadDocumento     INT,
    @i_idAccion              INT,
    @i_login                 VARCHAR(30),
    @i_Observacion           NVARCHAR(MAX),
    @o_idEstadoDocumento     INT OUTPUT,
    @o_Error                 VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- ======================================================
    -- Variables
    -- ======================================================
    DECLARE @EmpresaEjecucion          INT;
    DECLARE @idTipoDocumento           INT;   -- v9.2: resuelto desde CODIGO_OPCION
    DECLARE @CantidadInstanciasActivas INT;
    DECLARE @IdInstancia               INT;
    DECLARE @NextCorrInstancia         INT;   -- v9.1: MAX+1 para CORR_INSTANCIA (sin IDENTITY)
    DECLARE @NextCorrBitacora          INT;   -- v9.1: MAX+1 para CORR_BITACORA (sin IDENTITY)
    DECLARE @IdFlujoActual             INT;
    DECLARE @IdPasoActual              INT;
    DECLARE @IdEstadoActual            INT;
    DECLARE @IdPasoNuevo               INT;
    DECLARE @IdEstadoNuevo             INT;
    DECLARE @IdEstadoOrigen            INT;
    DECLARE @IdEstadoDestino           INT;       -- v8.1: solo para FASE 2A
    DECLARE @IdEstadoEsperaPaso        INT;       -- estado "mantiene" del paso actual (si tiene TIPO_MOVIMIENTO=4)
    DECLARE @AccionCodigo              INT;       -- 1..N segun config
    DECLARE @PermitidoAccion           BIT;
    DECLARE @EstadoDestinoAccion       INT;       -- CORR_ESTADO_DESTINO de la accion
    DECLARE @TipoMovimiento            TINYINT;   -- v9.0: 1=AVANZA 2=RETORNA 3=FINALIZA 4=MANTIENE 5=ANTERIOR
    DECLARE @TipoNotificacion          TINYINT;   -- v9.0: 1=ACTUAL 2=SIGUIENTE 3=CREADOR 4=ANTERIOR
    DECLARE @PasoDestinoConfig         INT;       -- v9.0: CORR_PASO_DESTINO de SEG_FLUJO_PASO_ACCION_ESTADO
    DECLARE @CorrActorPaso             INT;
    DECLARE @CorrActorDestinoPaso      INT;
    DECLARE @OrdenPasoActual           DECIMAL(10,2);
    DECLARE @MensajeNotifEnvio         NVARCHAR(500);
    

    DECLARE @UnidadPasoActual          INT;
    DECLARE @UnidadValidacion          INT;
    DECLARE @UnidadPasoNuevo           INT;
    DECLARE @CorrActorPasoNuevo        INT;
    DECLARE @CorrActorDestinoNuevo     INT;

    DECLARE @IdNotificacionGenerada    INT;
    DECLARE @ErrorNotificacion         VARCHAR(500);
    DECLARE @LoginDestino              VARCHAR(30);
    DECLARE @LoginCreador              VARCHAR(30);
    DECLARE @LoginMsg                  VARCHAR(30);
    DECLARE @EstadoEsOrigenAlt         BIT;
    DECLARE @ActorNotifDirecta         INT;
    DECLARE @UnidadNotifDirecta        INT;
    DECLARE @IdPasoSiguiente           INT;
    DECLARE @CorrActorSiguiente        INT;
    DECLARE @UnidadSiguiente           INT;
    DECLARE @CorrActorDestinoP1        INT;

    DECLARE @AutorizadoEjecutor        BIT;
    DECLARE @PrevPaso                  INT;
    DECLARE @PasoNotif                 INT;   -- paso que se usa para resolver destinatarios de notif

    -- Multi-actor iteration vars
    DECLARE @MA_CorrActor              INT;
    DECLARE @MA_CorrUnidad             INT;
    DECLARE @MA_UnidadMeta             INT;   -- v9.5: unidad efectiva para metadata (ISNULL de @MA_CorrUnidad)
    DECLARE @MA_Default_Unidad         INT;
    DECLARE @MA_Iter                   INT;
    DECLARE @MA_Total                  INT;

    DECLARE @Destinatarios TABLE (
        RowNum       INT         NOT NULL PRIMARY KEY,
        LoginDestino VARCHAR(30)
    );
    DECLARE @RowNum    INT;
    DECLARE @MaxRowNum INT;

    DECLARE @MultiDest TABLE (
        RowNum     INT NOT NULL PRIMARY KEY,
        CorrActor  INT,
        CorrUnidad INT
    );

    DECLARE @DestRaw TABLE (LoginDestino VARCHAR(30));
    DECLARE @YaNotificados TABLE (LoginDestino VARCHAR(30) PRIMARY KEY);

    -- ======================================================
    -- Variables para auto-aprobacion en cadena (v9.8)
    -- ======================================================
    DECLARE @AutoAprobCount        INT        = 0;
    DECLARE @MaxAutoAprobaciones   INT        = 5;
    DECLARE @AutoPermite           BIT;
    DECLARE @AutoActorPaso         INT;
    DECLARE @AutoActorDestinoPaso  INT;
    DECLARE @AutoUnidadPaso        INT;
    DECLARE @AutoOrden             DECIMAL(10,2);
    DECLARE @AutoUnidadValidacion  INT;
    DECLARE @AutoTipoResActor      VARCHAR(30);
    DECLARE @AutoAccion            INT;
    DECLARE @AutoEstadoAnterior    INT;
    DECLARE @AutoEstadoDestino2    INT;
    DECLARE @AutoTipoNotif2        TINYINT;
    DECLARE @AutoTipoMov2          TINYINT;
    DECLARE @AutoPasoDestino2      INT;
    DECLARE @AutoIdPasoNuevo       INT;
    DECLARE @AutoActorSig          INT;
    DECLARE @AutoActorDestSig      INT;
    DECLARE @AutoUnidadSig         INT;
    DECLARE @AutoActorParaInf      INT;

    SET @EmpresaEjecucion = @i_CORR_EMPRESA;
    IF @EmpresaEjecucion IS NULL SET @EmpresaEjecucion = 1;

    -- ======================================================
    -- PRE-FASE: Sincronizar jefes vencidos
    -- ======================================================
    UPDATE dbo.SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES
    SET ACTIVO         = 0,
        USUARIO_ACTU   = 'EjecutarFlujoProceso',
        ESTACION_ACTU  = 'SP_EjecutarFlujoProceso',
        FECHA_ACTU     = GETDATE()
    WHERE CORR_EMPRESA = @EmpresaEjecucion
      AND ACTIVO       = 1
      AND FECHA_FIN    IS NOT NULL
      AND FECHA_FIN    < CAST(GETDATE() AS DATE);

    -- ======================================================
    -- FASE 0: validaciones iniciales y resolucion de CODIGO_OPCION
    -- ======================================================
    
    -- v9.2: Resolver CORR_TIPO_DOCUMENTO desde CODIGO_OPCION
    SELECT @idTipoDocumento = CORR_TIPO_DOCUMENTO
    FROM dbo.SEG_FLUJO_TIPO_DOCUMENTO
    WHERE CORR_EMPRESA  = @EmpresaEjecucion
      AND CODIGO_OPCION = @i_CODIGO_OPCION
      AND ACTIVO        = 1;

    IF @idTipoDocumento IS NULL
    BEGIN
        SET @o_error = 'No se encontro un tipo de documento activo para la opcion: ' + @i_CODIGO_OPCION;
        RETURN -15;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.SEG_USUARIO WHERE LOGIN_SISTEMA = @i_login AND ESTADO_USUARIO = 1)
    BEGIN
        SET @LoginMsg = @i_login;
        IF @LoginMsg IS NULL SET @LoginMsg = 'NULL';
        SET @o_error = 'Usuario no valido o inactivo: ' + @LoginMsg;
        RETURN -1;
    END

    IF @i_Observacion IS NULL OR @i_Observacion = ''
    BEGIN
        SET @o_error = 'El comentario es obligatorio.';
        RETURN -2;
    END

    IF @i_idUnidadDocumento IS NULL
    BEGIN
        SELECT @i_idUnidadDocumento = CORR_UNIDAD_DOCUMENTO
        FROM dbo.SEG_FLUJO_INSTANCIA
        WHERE CORR_EMPRESA        = @EmpresaEjecucion
          AND CORR_TIPO_DOCUMENTO = @idTipoDocumento
          AND CORR_DOCUMENTO      = @i_idDocumento
          AND ACTIVO              = 1;
    END

    IF @i_idUnidadDocumento IS NULL
    BEGIN
        SET @o_error = 'No se pudo determinar la unidad del documento.';
        RETURN -13;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.VW_SEG_FLUJO_UNIDAD WHERE CORR_UNIDAD = @i_idUnidadDocumento)
    BEGIN
        SET @o_error = 'Unidad del documento no existe en el organigrama: ' + CAST(@i_idUnidadDocumento AS VARCHAR);
        RETURN -13;
    END

    -- ======================================================
    -- FASE 1: buscar instancia activa
    -- ======================================================
    SELECT @IdInstancia    = CORR_INSTANCIA,
           @IdFlujoActual  = CORR_FLUJO_PROCESO,
           @IdPasoActual   = CORR_PASO_ACTUAL,
           @IdEstadoActual = CORR_ESTADO_ACTUAL
    FROM dbo.SEG_FLUJO_INSTANCIA
    WHERE CORR_EMPRESA        = @EmpresaEjecucion
      AND CORR_TIPO_DOCUMENTO = @idTipoDocumento
      AND CORR_DOCUMENTO      = @i_idDocumento
      AND ACTIVO              = 1;

    SELECT @CantidadInstanciasActivas = COUNT(*)
    FROM dbo.SEG_FLUJO_INSTANCIA
    WHERE CORR_EMPRESA        = @EmpresaEjecucion
      AND CORR_TIPO_DOCUMENTO = @idTipoDocumento
      AND CORR_DOCUMENTO      = @i_idDocumento
      AND ACTIVO              = 1;

    IF @CantidadInstanciasActivas > 1
    BEGIN
        SET @o_error = 'Existe mas de una instancia activa para este documento. Corregir datos.';
        RETURN -11;
    END

    -- ======================================================
    -- FASE 2A: crear nueva instancia (primera vez, accion=1/APROBAR)
    -- ======================================================
    IF @IdInstancia IS NULL AND @i_idAccion = 1
    BEGIN
        -- v9.2: resolver flujo por defecto desde CODIGO_OPCION
        SELECT TOP 1 @IdFlujoActual = CORR_FLUJO_PROCESO
        FROM dbo.SEG_FLUJO_PROCESO
        WHERE CORR_EMPRESA        = @EmpresaEjecucion
          AND CORR_TIPO_DOCUMENTO = @idTipoDocumento
          AND ACTIVO              = 1
          AND ES_DEFECTO          = 1;

        IF @IdFlujoActual IS NULL
        BEGIN
            SET @o_error = 'No hay flujo activo para este tipo de documento.';
            RETURN -3;
        END

        SELECT TOP 1
            @IdPasoActual           = CORR_PASO,
            @IdEstadoOrigen         = CORR_ESTADO_ORIGEN,
            @CorrActorPaso          = CORR_ACTOR_ORIGEN,
            @CorrActorDestinoP1     = CORR_ACTOR_DESTINO,
            @UnidadPasoActual       = CORR_UNIDAD_DESTINO
        FROM dbo.SEG_FLUJO_PASO
        WHERE CORR_EMPRESA       = @EmpresaEjecucion
          AND CORR_FLUJO_PROCESO = @IdFlujoActual
          AND ORDEN              = 1;

        IF @IdPasoActual IS NULL
        BEGIN
            SET @o_error = 'El flujo no tiene paso inicial (ORDEN=1).';
            RETURN -4;
        END

        -- Leer configuracion de accion 1 del paso inicial
        SELECT @IdEstadoDestino   = CORR_ESTADO_DESTINO,
               @TipoMovimiento    = CORR_TIPO_MOVIMIENTO,
               @TipoNotificacion  = CORR_TIPO_NOTIFICACION,
               @PasoDestinoConfig = CORR_PASO_DESTINO
        FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
        WHERE CORR_EMPRESA     = @EmpresaEjecucion
          AND CORR_FLUJO_PROCESO = @IdFlujoActual
          AND CORR_PASO        = @IdPasoActual
          AND CORR_ACCION      = 1
          AND ACTIVO           = 1;

        IF @IdEstadoDestino IS NULL
        BEGIN
            SET @o_error = 'El paso inicial no tiene configurada la accion APROBAR (1) en SEG_FLUJO_PASO_ACCION_ESTADO.';
            RETURN -4;
        END

        DECLARE @TipoResActorP1 VARCHAR(30);
        SET @TipoResActorP1 = dbo.SEG_FN_ObtenerTipoResolucionActor(@EmpresaEjecucion, @CorrActorPaso);

        IF @TipoResActorP1 IN ('JEFE_UNIDAD', 'JEFE_INMEDIATO')
            SET @UnidadValidacion = @i_idUnidadDocumento;
        ELSE
            -- MANUAL: usa unidad del paso; NULL = cualquier asignacion activa del actor (v9.5)
            SET @UnidadValidacion = @UnidadPasoActual;

        IF dbo.SEG_FN_UsuarioMatchActorUnidad(@i_login, @CorrActorPaso, @UnidadValidacion, @EmpresaEjecucion) = 0
        BEGIN
            SET @o_error = 'Usuario no autorizado para iniciar el flujo (no satisface el actor del paso 1).';
            RETURN -5;
        END

        BEGIN TRY
            BEGIN TRAN;

            -- v9.1: calcular CORR_INSTANCIA con MAX+1 (sin IDENTITY)
            SELECT @NextCorrInstancia = ISNULL(MAX(CORR_INSTANCIA), 0) + 1
            FROM dbo.SEG_FLUJO_INSTANCIA
            WHERE CORR_EMPRESA = @EmpresaEjecucion;

            INSERT INTO dbo.SEG_FLUJO_INSTANCIA (
                CORR_EMPRESA, CORR_INSTANCIA, CORR_TIPO_DOCUMENTO, CORR_DOCUMENTO,
                CORR_FLUJO_PROCESO, CORR_PASO_ACTUAL, CORR_ESTADO_ACTUAL,
                CORR_UNIDAD_DOCUMENTO, ACTIVO, USUARIO_CREA, ESTACION_CREA
            ) VALUES (
                @EmpresaEjecucion, @NextCorrInstancia, @idTipoDocumento, @i_idDocumento,
                @IdFlujoActual, @IdPasoActual, @IdEstadoOrigen,
                @i_idUnidadDocumento, 1, @i_login, 'SP_EjecutarFlujo'
            );

            SET @IdInstancia = @NextCorrInstancia;

            -- v9.1: calcular CORR_BITACORA con MAX+1 (sin IDENTITY)
            SELECT @NextCorrBitacora = ISNULL(MAX(CORR_BITACORA), 0) + 1
            FROM dbo.SEG_FLUJO_BITACORA
            WHERE CORR_EMPRESA = @EmpresaEjecucion;

           INSERT INTO dbo.SEG_FLUJO_BITACORA (
            CORR_EMPRESA, CORR_BITACORA, CORR_INSTANCIA, CORR_PASO,
            TIPO_USUARIO, LOGIN_SISTEMA, COMENTARIO,
            CORR_ESTADO_ANTERIOR, CORR_ESTADO_NUEVO,
            CORR_UNIDAD_EJECUTOR, USUARIO_CREA, ESTACION_CREA
            ) VALUES (
                @EmpresaEjecucion, @NextCorrBitacora, @IdInstancia, @IdPasoActual,
                @CorrActorPaso, @i_login, @i_Observacion,
                NULL, @IdEstadoOrigen,
                @i_idUnidadDocumento, @i_login, 'SP_EjecutarFlujo'
            );

            -- Calcular paso siguiente data-driven segun TIPO_MOVIMIENTO
            IF @TipoMovimiento = 1  -- AVANZA
            BEGIN
                IF @PasoDestinoConfig IS NOT NULL
                    SET @IdPasoSiguiente = @PasoDestinoConfig;
                ELSE
                    SELECT TOP 1 @IdPasoSiguiente = CORR_PASO
                    FROM dbo.SEG_FLUJO_PASO
                    WHERE CORR_EMPRESA       = @EmpresaEjecucion
                      AND CORR_FLUJO_PROCESO = @IdFlujoActual
                      AND ORDEN              > 1
                    ORDER BY ORDEN ASC;

                SELECT @CorrActorSiguiente = CORR_ACTOR_ORIGEN,
                       @UnidadSiguiente    = CORR_UNIDAD_DESTINO
                FROM dbo.SEG_FLUJO_PASO
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @IdPasoSiguiente;

                IF @UnidadSiguiente IS NULL
                BEGIN
                    SET @UnidadSiguiente = dbo.SEG_FN_InferirUnidadActor(@EmpresaEjecucion, @CorrActorSiguiente);
                    IF @UnidadSiguiente IS NULL SET @UnidadSiguiente = @i_idUnidadDocumento;
                END
                SET @CorrActorDestinoNuevo = @CorrActorSiguiente;
                IF @CorrActorDestinoP1 IS NOT NULL SET @CorrActorDestinoNuevo = @CorrActorDestinoP1;
            END
            ELSE IF @TipoMovimiento = 4  -- MANTIENE: queda en el mismo paso inicial
                SET @IdPasoSiguiente = @IdPasoActual;
            -- FINALIZA (3): @IdPasoSiguiente queda NULL

            IF @TipoMovimiento = 4
            BEGIN
                UPDATE dbo.SEG_FLUJO_INSTANCIA
                SET CORR_ESTADO_ACTUAL = @IdEstadoDestino,
                    USUARIO_ACTU       = @i_login,
                    ESTACION_ACTU      = 'SP_EjecutarFlujo',
                    FECHA_ACTU         = GETDATE()
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_INSTANCIA = @IdInstancia;
            END
            ELSE IF @TipoMovimiento = 3
            BEGIN
                UPDATE dbo.SEG_FLUJO_INSTANCIA
                SET ACTIVO             = 0,
                    FECHA_FIN          = GETDATE(),
                    CORR_ESTADO_ACTUAL = @IdEstadoDestino,
                    CORR_PASO_ACTUAL   = NULL,
                    USUARIO_ACTU       = @i_login,
                    ESTACION_ACTU      = 'SP_EjecutarFlujo',
                    FECHA_ACTU         = GETDATE()
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_INSTANCIA = @IdInstancia;
            END
            ELSE  -- AVANZA: mueve al paso calculado
            BEGIN
                UPDATE dbo.SEG_FLUJO_INSTANCIA
                SET CORR_PASO_ACTUAL   = @IdPasoSiguiente,
                    CORR_ESTADO_ACTUAL = @IdEstadoDestino,
                    USUARIO_ACTU       = @i_login,
                    ESTACION_ACTU      = 'SP_EjecutarFlujo',
                    FECHA_ACTU         = GETDATE()
                WHERE CORR_EMPRESA   = @EmpresaEjecucion
                  AND CORR_INSTANCIA = @IdInstancia;
            END

            -- Notificar segun TIPO_NOTIFICACION (data-driven, igual que FASE 6)
            SET @LoginCreador      = @i_login;
            SET @MensajeNotifEnvio = N'Tarea pendiente en el flujo.';

            IF @TipoNotificacion = 2 AND @IdPasoSiguiente IS NOT NULL  -- SIGUIENTE
            BEGIN
                DELETE FROM @YaNotificados;

                -- v9.8: pre-verificar si el ejecutor auto-aprobara el siguiente paso.
                -- Si satisface el actor del paso SIGUIENTE con PERMITE_AUTO_APROBACION=1,
                -- se excluye de las notificaciones regulares (el WHILE lo procesara despues).
                SET @AutoPermite = 0; SET @AutoActorPaso = NULL; SET @AutoUnidadPaso = NULL;
                SELECT @AutoPermite = ISNULL(PERMITE_AUTO_APROBACION, 0),
                       @AutoActorPaso = CORR_ACTOR_ORIGEN, @AutoUnidadPaso = CORR_UNIDAD_DESTINO
                FROM dbo.SEG_FLUJO_PASO
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @IdPasoSiguiente;
                IF @AutoPermite = 1
                BEGIN
                    SET @AutoTipoResActor = dbo.SEG_FN_ObtenerTipoResolucionActor(@EmpresaEjecucion, @AutoActorPaso);
                    IF @AutoTipoResActor IN ('JEFE_UNIDAD', 'JEFE_INMEDIATO') SET @AutoUnidadValidacion = @i_idUnidadDocumento;
                    ELSE SET @AutoUnidadValidacion = @AutoUnidadPaso;
                    IF dbo.SEG_FN_UsuarioMatchActorUnidad(@i_login, @AutoActorPaso, @AutoUnidadValidacion, @EmpresaEjecucion) = 0
                        SET @AutoPermite = 0;  -- No auto-aprobara: mantenerlo en las notificaciones
                END

                -- 1) Destino principal del paso siguiente
                DELETE FROM @Destinatarios;
                DELETE FROM @DestRaw;
                INSERT INTO @DestRaw (LoginDestino)
                EXEC dbo.SEG_SP_ResolverDestinatariosPaso
                    @CORR_EMPRESA         = @EmpresaEjecucion,
                    @CORR_PASO            = @IdPasoSiguiente,
                    @UnidadDocumento      = @i_idUnidadDocumento,
                    @LoginEjecutor        = NULL,
                    @CORR_ACTOR_OVERRIDE  = @CorrActorDestinoP1,
                    @CORR_UNIDAD_OVERRIDE = @UnidadPasoActual;  -- v9.4: CORR_UNIDAD_DESTINO del paso actual aplica al actor destino
                IF @AutoPermite = 1 DELETE FROM @DestRaw WHERE LoginDestino = @i_login;
                INSERT INTO @Destinatarios (RowNum, LoginDestino)
                SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), LoginDestino FROM @DestRaw;

                -- Si el ejecutor auto-aprobara, es valido no tener destinatarios SIGUIENTE adicionales
                IF @AutoPermite = 0 AND NOT EXISTS (SELECT 1 FROM @Destinatarios)
                    THROW 50001, 'No se encontraron destinatarios para el paso siguiente.', 1;

                SELECT @RowNum = 1, @MaxRowNum = COUNT(*) FROM @Destinatarios;
                WHILE @RowNum <= @MaxRowNum
                BEGIN
                    SELECT @LoginDestino = LoginDestino FROM @Destinatarios WHERE RowNum = @RowNum;

                    EXEC dbo.GenerarNotificacionesFlujo
                        @i_CORR_EMPRESA          = @EmpresaEjecucion,
                        @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                        @i_CORR_DOCUMENTO        = @i_idDocumento,
                        @i_CORR_INSTANCIA        = @IdInstancia,
                        @i_CORR_PASO             = @IdPasoSiguiente,
                        @i_CORR_ACTOR_DESTINO    = @CorrActorDestinoNuevo,
                        @i_CORR_UNIDAD           = @UnidadSiguiente,
                        @i_MENSAJE               = @MensajeNotifEnvio,
                        @i_LOGIN_USUARIO_DESTINO = @LoginDestino,
                        @i_LOGIN_EJECUTOR        = @i_login,
                        @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                        @i_CORR_ESTADO           = @IdEstadoDestino,
                        @i_CORR_PASO_EJECUTOR    = @IdPasoActual,
                        @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                        @o_ERROR                 = @ErrorNotificacion OUTPUT;

                    IF @ErrorNotificacion IS NOT NULL
                        THROW 50001, @ErrorNotificacion, 1;

                    IF NOT EXISTS (SELECT 1 FROM @YaNotificados WHERE LoginDestino = @LoginDestino)
                        INSERT INTO @YaNotificados (LoginDestino) VALUES (@LoginDestino);

                    SET @RowNum = @RowNum + 1;
                END

                -- 2) Multi-actor destinos del Paso 1
                SET @MA_Default_Unidad = @UnidadSiguiente;

                DELETE FROM @MultiDest;
                INSERT INTO @MultiDest (RowNum, CorrActor, CorrUnidad)
                SELECT ROW_NUMBER() OVER (ORDER BY ORDEN, CORR_PASO_ACTOR_DESTINO),
                       CORR_ACTOR, CORR_UNIDAD  -- v9.5: NULL = todos los usuarios del actor
                FROM dbo.SEG_FLUJO_PASO_ACTOR_DESTINO
                WHERE CORR_EMPRESA = @EmpresaEjecucion
                  AND CORR_PASO    = @IdPasoActual
                  AND ACTIVO       = 1;

                SELECT @MA_Iter = 1, @MA_Total = COUNT(*) FROM @MultiDest;
                WHILE @MA_Iter <= @MA_Total
                BEGIN
                    SELECT @MA_CorrActor = CorrActor, @MA_CorrUnidad = CorrUnidad
                    FROM @MultiDest WHERE RowNum = @MA_Iter;
                    -- v9.5: calcular unidad efectiva para metadata (EXEC no admite ISNULL como argumento)
                    SET @MA_UnidadMeta = ISNULL(@MA_CorrUnidad, @i_idUnidadDocumento);

                    DELETE FROM @Destinatarios;
                    DELETE FROM @DestRaw;
                    INSERT INTO @DestRaw (LoginDestino)
                    EXEC dbo.SEG_SP_ResolverDestinatariosPaso
                        @CORR_EMPRESA         = @EmpresaEjecucion,
                        @CORR_PASO            = @IdPasoSiguiente,
                        @UnidadDocumento      = @i_idUnidadDocumento,
                        @LoginEjecutor        = NULL,
                        @CORR_ACTOR_OVERRIDE  = @MA_CorrActor,
                        @CORR_UNIDAD_OVERRIDE = @MA_CorrUnidad;
                    -- v9.8: excluir ejecutor si auto-aprobara el siguiente paso
                    IF @AutoPermite = 1 DELETE FROM @DestRaw WHERE LoginDestino = @i_login;
                    INSERT INTO @Destinatarios (RowNum, LoginDestino)
                    SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), LoginDestino
                    FROM @DestRaw
                    WHERE LoginDestino NOT IN (SELECT LoginDestino FROM @YaNotificados);

                    SELECT @RowNum = 1, @MaxRowNum = COUNT(*) FROM @Destinatarios;
                    WHILE @RowNum <= @MaxRowNum
                    BEGIN
                        SELECT @LoginDestino = LoginDestino FROM @Destinatarios WHERE RowNum = @RowNum;

                        EXEC dbo.GenerarNotificacionesFlujo
                            @i_CORR_EMPRESA          = @EmpresaEjecucion,
                            @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                            @i_CORR_DOCUMENTO        = @i_idDocumento,
                            @i_CORR_INSTANCIA        = @IdInstancia,
                            @i_CORR_PASO             = @IdPasoSiguiente,
                            @i_CORR_ACTOR_DESTINO    = @MA_CorrActor,
                            @i_CORR_UNIDAD           = @MA_UnidadMeta,  -- v9.5: metadata no-NULL
                            @i_MENSAJE               = @MensajeNotifEnvio,
                            @i_LOGIN_USUARIO_DESTINO = @LoginDestino,
                            @i_LOGIN_EJECUTOR        = @i_login,
                            @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                            @i_CORR_ESTADO           = @IdEstadoDestino,
                            @i_CORR_PASO_EJECUTOR    = @IdPasoActual,
                            @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                            @o_ERROR                 = @ErrorNotificacion OUTPUT;

                        IF @ErrorNotificacion IS NOT NULL
                            THROW 50007, @ErrorNotificacion, 1;

                        IF NOT EXISTS (SELECT 1 FROM @YaNotificados WHERE LoginDestino = @LoginDestino)
                            INSERT INTO @YaNotificados (LoginDestino) VALUES (@LoginDestino);

                        SET @RowNum = @RowNum + 1;
                    END

                    SET @MA_Iter = @MA_Iter + 1;
                END
            END
            ELSE IF @TipoNotificacion = 3  -- CREADOR
            BEGIN
                SET @ActorNotifDirecta  = @CorrActorPaso;
                IF @CorrActorDestinoP1 IS NOT NULL SET @ActorNotifDirecta = @CorrActorDestinoP1;
                SET @UnidadNotifDirecta = @i_idUnidadDocumento;
                EXEC dbo.GenerarNotificacionesFlujo
                    @i_CORR_EMPRESA          = @EmpresaEjecucion,
                    @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                    @i_CORR_DOCUMENTO        = @i_idDocumento,
                    @i_CORR_INSTANCIA        = @IdInstancia,
                    @i_CORR_PASO             = @IdPasoActual,
                    @i_CORR_ACTOR_DESTINO    = @ActorNotifDirecta,
                    @i_CORR_UNIDAD           = @UnidadNotifDirecta,
                    @i_MENSAJE               = @MensajeNotifEnvio,
                    @i_LOGIN_USUARIO_DESTINO = @LoginCreador,
                    @i_LOGIN_EJECUTOR        = @i_login,
                    @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                    @i_CORR_ESTADO           = @IdEstadoDestino,
                    @i_CORR_PASO_EJECUTOR    = @IdPasoActual,
                    @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                    @o_ERROR                 = @ErrorNotificacion OUTPUT;
                IF @ErrorNotificacion IS NOT NULL
                    THROW 50006, @ErrorNotificacion, 1;
            END
            -- TIPO_NOT 1(ACTUAL), 4(ANTERIOR), 5(NO NOTIFICA): sin accion en primera ejecucion

            IF @TipoMovimiento = 3
            BEGIN
                UPDATE dbo.SEG_FLUJO_NOTIFICACION
                SET PROCESADO=1, USUARIO_ACTU=@i_login, FECHA_ACTU=GETDATE()
                WHERE CORR_EMPRESA=@EmpresaEjecucion AND CORR_INSTANCIA=@IdInstancia AND PROCESADO=0;
            END

            -- ======================================================
            -- FASE 7 (FASE 2A): Auto-aprobacion en cadena (v9.8)
            -- Mismo comportamiento que FASE 7 en FASE 2B pero aplicado
            -- al primer paso (creacion de instancia).
            -- ======================================================
            SET @IdPasoNuevo   = @IdPasoSiguiente;
            SET @IdEstadoNuevo  = @IdEstadoDestino;
            SET @AutoAprobCount = 0;

            WHILE @IdPasoNuevo IS NOT NULL
              AND @TipoMovimiento = 1
              AND @AutoAprobCount < @MaxAutoAprobaciones
            BEGIN
                SET @AutoPermite          = 0;
                SET @AutoActorPaso        = NULL;
                SET @AutoActorDestinoPaso = NULL;
                SET @AutoUnidadPaso       = NULL;
                SET @AutoOrden            = NULL;

                SELECT @AutoPermite          = ISNULL(PERMITE_AUTO_APROBACION, 0),
                       @AutoActorPaso        = CORR_ACTOR_ORIGEN,
                       @AutoActorDestinoPaso = CORR_ACTOR_DESTINO,
                       @AutoUnidadPaso       = CORR_UNIDAD_DESTINO,
                       @AutoOrden            = ORDEN
                FROM dbo.SEG_FLUJO_PASO
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @IdPasoNuevo;

                IF @AutoPermite = 0 BREAK;

                SET @AutoTipoResActor = dbo.SEG_FN_ObtenerTipoResolucionActor(@EmpresaEjecucion, @AutoActorPaso);
                IF @AutoTipoResActor IN ('JEFE_UNIDAD', 'JEFE_INMEDIATO')
                    SET @AutoUnidadValidacion = @i_idUnidadDocumento;
                ELSE
                    SET @AutoUnidadValidacion = @AutoUnidadPaso;

                IF dbo.SEG_FN_UsuarioMatchActorUnidad(@i_login, @AutoActorPaso, @AutoUnidadValidacion, @EmpresaEjecucion) = 0
                    BREAK;

                SET @AutoAccion = NULL;
                SELECT TOP 1
                    @AutoAccion         = CORR_ACCION,
                    @AutoEstadoDestino2 = CORR_ESTADO_DESTINO,
                    @AutoTipoNotif2     = CORR_TIPO_NOTIFICACION,
                    @AutoTipoMov2       = CORR_TIPO_MOVIMIENTO,
                    @AutoPasoDestino2   = CORR_PASO_DESTINO
                FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
                WHERE CORR_EMPRESA         = @EmpresaEjecucion
                  AND CORR_FLUJO_PROCESO   = @IdFlujoActual
                  AND CORR_PASO            = @IdPasoNuevo
                  AND CORR_TIPO_MOVIMIENTO = 1
                  AND ACTIVO               = 1
                ORDER BY CORR_ACCION;

                IF @AutoAccion IS NULL BREAK;

                SET @AutoIdPasoNuevo = NULL;
                IF @AutoPasoDestino2 IS NOT NULL
                    SET @AutoIdPasoNuevo = @AutoPasoDestino2;
                ELSE IF @AutoTipoMov2 = 1
                    SELECT TOP 1 @AutoIdPasoNuevo = CORR_PASO
                    FROM dbo.SEG_FLUJO_PASO
                    WHERE CORR_EMPRESA       = @EmpresaEjecucion
                      AND CORR_FLUJO_PROCESO = @IdFlujoActual
                      AND ORDEN              > @AutoOrden
                    ORDER BY ORDEN ASC;

                SET @AutoEstadoAnterior = @IdEstadoNuevo;

                SELECT @NextCorrBitacora = ISNULL(MAX(CORR_BITACORA), 0) + 1
                FROM dbo.SEG_FLUJO_BITACORA WHERE CORR_EMPRESA = @EmpresaEjecucion;

                INSERT INTO dbo.SEG_FLUJO_BITACORA (
                    CORR_EMPRESA, CORR_BITACORA, CORR_INSTANCIA, CORR_PASO,
                    TIPO_USUARIO, LOGIN_SISTEMA, COMENTARIO,
                    CORR_ESTADO_ANTERIOR, CORR_ESTADO_NUEVO,
                    CORR_UNIDAD_EJECUTOR, USUARIO_CREA, ESTACION_CREA
                ) VALUES (
                    @EmpresaEjecucion, @NextCorrBitacora, @IdInstancia, @IdPasoNuevo,
                    @AutoActorPaso, @i_login,
                    N'[AUTO] Paso ejecutado automaticamente: el ejecutor satisface el actor del paso',
                    @AutoEstadoAnterior, @AutoEstadoDestino2,
                    @i_idUnidadDocumento, @i_login, 'SP_EjecutarFlujo'
                );

                UPDATE dbo.SEG_FLUJO_NOTIFICACION
                SET PROCESADO    = 1,
                    USUARIO_ACTU = @i_login,
                    FECHA_ACTU   = GETDATE()
                WHERE CORR_EMPRESA         = @EmpresaEjecucion
                  AND CORR_INSTANCIA       = @IdInstancia
                  AND LOGIN_SISTEMA_DESTINO = @i_login
                  AND PROCESADO            = 0;

                SET @IdEstadoNuevo = @AutoEstadoDestino2;

                IF @AutoTipoMov2 = 3
                BEGIN
                    UPDATE dbo.SEG_FLUJO_INSTANCIA
                    SET ACTIVO             = 0,
                        FECHA_FIN          = GETDATE(),
                        CORR_ESTADO_ACTUAL = @AutoEstadoDestino2,
                        CORR_PASO_ACTUAL   = NULL,
                        USUARIO_ACTU       = @i_login,
                        ESTACION_ACTU      = 'SP_EjecutarFlujo',
                        FECHA_ACTU         = GETDATE()
                    WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_INSTANCIA = @IdInstancia;
                END
                ELSE
                BEGIN
                    UPDATE dbo.SEG_FLUJO_INSTANCIA
                    SET CORR_PASO_ACTUAL   = @AutoIdPasoNuevo,
                        CORR_ESTADO_ACTUAL = @AutoEstadoDestino2,
                        USUARIO_ACTU       = @i_login,
                        ESTACION_ACTU      = 'SP_EjecutarFlujo',
                        FECHA_ACTU         = GETDATE()
                    WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_INSTANCIA = @IdInstancia;
                END

                SET @MensajeNotifEnvio = N'Tarea pendiente en el flujo.';
                DELETE FROM @YaNotificados;

                IF @AutoTipoNotif2 = 2 AND @AutoIdPasoNuevo IS NOT NULL
                BEGIN
                    -- Notificaciones SIGUIENTE: misma logica que el flujo normal.
                    -- @AutoActorDestinoPaso = CORR_ACTOR_DESTINO del paso auto-aprobado (ej. ANALISTA_TH)
                    -- @AutoUnidadPaso       = CORR_UNIDAD_DESTINO del paso auto-aprobado
                    -- El ejecutor (@i_login) se excluye de todos los destinatarios.
                    SET @AutoActorSig = NULL; SET @AutoActorDestSig = NULL; SET @AutoUnidadSig = NULL;
                    SELECT @AutoActorSig = CORR_ACTOR_ORIGEN, @AutoActorDestSig = CORR_ACTOR_DESTINO, @AutoUnidadSig = CORR_UNIDAD_DESTINO
                    FROM dbo.SEG_FLUJO_PASO WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @AutoIdPasoNuevo;
                    IF @AutoUnidadSig IS NULL
                    BEGIN
                        -- Igual que flujo normal: infiere desde el actor destino del paso auto-aprobado
                        SET @AutoActorParaInf = ISNULL(@AutoActorDestinoPaso, @AutoActorSig);
                        SET @AutoUnidadSig = dbo.SEG_FN_InferirUnidadActor(@EmpresaEjecucion, @AutoActorParaInf);
                        IF @AutoUnidadSig IS NULL SET @AutoUnidadSig = @i_idUnidadDocumento;
                    END
                    -- Usar el CORR_ACTOR_DESTINO del paso auto-aprobado como override (igual que flujo normal)
                    SET @CorrActorDestinoNuevo = ISNULL(@AutoActorDestinoPaso, @AutoActorSig);

                    DELETE FROM @Destinatarios; DELETE FROM @DestRaw;
                    INSERT INTO @DestRaw (LoginDestino)
                    EXEC dbo.SEG_SP_ResolverDestinatariosPaso
                        @CORR_EMPRESA = @EmpresaEjecucion, @CORR_PASO = @AutoIdPasoNuevo,
                        @UnidadDocumento = @i_idUnidadDocumento, @LoginEjecutor = NULL,
                        @CORR_ACTOR_OVERRIDE = @AutoActorDestinoPaso, @CORR_UNIDAD_OVERRIDE = @AutoUnidadPaso;
                    -- Excluir al ejecutor auto-aprobador: no tiene sentido notificarse a si mismo
                    DELETE FROM @DestRaw WHERE LoginDestino = @i_login;
                    INSERT INTO @Destinatarios (RowNum, LoginDestino)
                    SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), LoginDestino
                    FROM @DestRaw WHERE LoginDestino NOT IN (SELECT LoginDestino FROM @YaNotificados);

                    SELECT @RowNum = 1, @MaxRowNum = COUNT(*) FROM @Destinatarios;
                    WHILE @RowNum <= @MaxRowNum
                    BEGIN
                        SELECT @LoginDestino = LoginDestino FROM @Destinatarios WHERE RowNum = @RowNum;
                        EXEC dbo.GenerarNotificacionesFlujo
                            @i_CORR_EMPRESA=@EmpresaEjecucion, @i_CORR_TIPO_DOCUMENTO=@idTipoDocumento,
                            @i_CORR_DOCUMENTO=@i_idDocumento, @i_CORR_INSTANCIA=@IdInstancia,
                            @i_CORR_PASO=@AutoIdPasoNuevo, @i_CORR_ACTOR_DESTINO=@CorrActorDestinoNuevo,
                            @i_CORR_UNIDAD=@AutoUnidadSig, @i_MENSAJE=@MensajeNotifEnvio,
                            @i_LOGIN_USUARIO_DESTINO=@LoginDestino, @i_LOGIN_EJECUTOR=@i_login,
                            @i_LOGIN_SISTEMA_ORIGEN=@i_login, @i_CORR_ESTADO=@AutoEstadoDestino2,
                            @i_CORR_PASO_EJECUTOR=@IdPasoNuevo,
                            @o_CORR_NOTIFICACION=@IdNotificacionGenerada OUTPUT, @o_ERROR=@ErrorNotificacion OUTPUT;
                        IF @ErrorNotificacion IS NOT NULL THROW 50023, @ErrorNotificacion, 1;
                        IF NOT EXISTS (SELECT 1 FROM @YaNotificados WHERE LoginDestino = @LoginDestino)
                            INSERT INTO @YaNotificados (LoginDestino) VALUES (@LoginDestino);
                        SET @RowNum = @RowNum + 1;
                    END

                    -- Multi-actor del paso auto-aprobado (notifica al paso resultante)
                    DELETE FROM @MultiDest;
                    INSERT INTO @MultiDest (RowNum, CorrActor, CorrUnidad)
                    SELECT ROW_NUMBER() OVER (ORDER BY ORDEN, CORR_PASO_ACTOR_DESTINO), CORR_ACTOR, CORR_UNIDAD
                    FROM dbo.SEG_FLUJO_PASO_ACTOR_DESTINO
                    WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @IdPasoNuevo AND ACTIVO = 1;
                    SELECT @MA_Iter = 1, @MA_Total = COUNT(*) FROM @MultiDest;
                    WHILE @MA_Iter <= @MA_Total
                    BEGIN
                        SELECT @MA_CorrActor = CorrActor, @MA_CorrUnidad = CorrUnidad FROM @MultiDest WHERE RowNum = @MA_Iter;
                        SET @MA_UnidadMeta = ISNULL(@MA_CorrUnidad, @i_idUnidadDocumento);
                        DELETE FROM @Destinatarios; DELETE FROM @DestRaw;
                        INSERT INTO @DestRaw (LoginDestino)
                        EXEC dbo.SEG_SP_ResolverDestinatariosPaso
                            @CORR_EMPRESA=@EmpresaEjecucion, @CORR_PASO=@AutoIdPasoNuevo,
                            @UnidadDocumento=@i_idUnidadDocumento, @LoginEjecutor=NULL,
                            @CORR_ACTOR_OVERRIDE=@MA_CorrActor, @CORR_UNIDAD_OVERRIDE=@MA_CorrUnidad;
                        -- Excluir al ejecutor auto-aprobador del multi-actor tambien
                        DELETE FROM @DestRaw WHERE LoginDestino = @i_login;
                        INSERT INTO @Destinatarios (RowNum, LoginDestino)
                        SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), LoginDestino
                        FROM @DestRaw WHERE LoginDestino NOT IN (SELECT LoginDestino FROM @YaNotificados);
                        SELECT @RowNum = 1, @MaxRowNum = COUNT(*) FROM @Destinatarios;
                        WHILE @RowNum <= @MaxRowNum
                        BEGIN
                            SELECT @LoginDestino = LoginDestino FROM @Destinatarios WHERE RowNum = @RowNum;
                            EXEC dbo.GenerarNotificacionesFlujo
                                @i_CORR_EMPRESA=@EmpresaEjecucion, @i_CORR_TIPO_DOCUMENTO=@idTipoDocumento,
                                @i_CORR_DOCUMENTO=@i_idDocumento, @i_CORR_INSTANCIA=@IdInstancia,
                                @i_CORR_PASO=@AutoIdPasoNuevo, @i_CORR_ACTOR_DESTINO=@MA_CorrActor,
                                @i_CORR_UNIDAD=@MA_UnidadMeta, @i_MENSAJE=@MensajeNotifEnvio,
                                @i_LOGIN_USUARIO_DESTINO=@LoginDestino, @i_LOGIN_EJECUTOR=@i_login,
                                @i_LOGIN_SISTEMA_ORIGEN=@i_login, @i_CORR_ESTADO=@AutoEstadoDestino2,
                                @i_CORR_PASO_EJECUTOR=@IdPasoNuevo,
                                @o_CORR_NOTIFICACION=@IdNotificacionGenerada OUTPUT, @o_ERROR=@ErrorNotificacion OUTPUT;
                            IF @ErrorNotificacion IS NOT NULL THROW 50024, @ErrorNotificacion, 1;
                            IF NOT EXISTS (SELECT 1 FROM @YaNotificados WHERE LoginDestino = @LoginDestino)
                                INSERT INTO @YaNotificados (LoginDestino) VALUES (@LoginDestino);
                            SET @RowNum = @RowNum + 1;
                        END
                        SET @MA_Iter = @MA_Iter + 1;
                    END
                END
                ELSE IF @AutoTipoNotif2 = 3
                BEGIN
                    EXEC dbo.GenerarNotificacionesFlujo
                        @i_CORR_EMPRESA=@EmpresaEjecucion, @i_CORR_TIPO_DOCUMENTO=@idTipoDocumento,
                        @i_CORR_DOCUMENTO=@i_idDocumento, @i_CORR_INSTANCIA=@IdInstancia,
                        @i_CORR_PASO=@IdPasoNuevo, @i_CORR_ACTOR_DESTINO=@AutoActorPaso,
                        @i_CORR_UNIDAD=@i_idUnidadDocumento, @i_MENSAJE=@MensajeNotifEnvio,
                        @i_LOGIN_USUARIO_DESTINO=@LoginCreador, @i_LOGIN_EJECUTOR=@i_login,
                        @i_LOGIN_SISTEMA_ORIGEN=@i_login, @i_CORR_ESTADO=@AutoEstadoDestino2,
                        @i_CORR_PASO_EJECUTOR=@IdPasoNuevo,
                        @o_CORR_NOTIFICACION=@IdNotificacionGenerada OUTPUT, @o_ERROR=@ErrorNotificacion OUTPUT;
                    IF @ErrorNotificacion IS NOT NULL THROW 50025, @ErrorNotificacion, 1;
                END

                IF @AutoTipoMov2 = 3
                BEGIN
                    UPDATE dbo.SEG_FLUJO_NOTIFICACION
                    SET PROCESADO=1, USUARIO_ACTU=@i_login, FECHA_ACTU=GETDATE()
                    WHERE CORR_EMPRESA=@EmpresaEjecucion AND CORR_INSTANCIA=@IdInstancia AND PROCESADO=0;
                END

                SET @IdPasoNuevo    = @AutoIdPasoNuevo;
                SET @TipoMovimiento = @AutoTipoMov2;
                SET @AutoAprobCount = @AutoAprobCount + 1;

            END  -- FIN WHILE auto-aprobacion FASE 2A (v9.8)

            COMMIT TRAN;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRAN;
            SET @o_error = 'Error al crear instancia: ' + ERROR_MESSAGE();
            RETURN -50;
        END CATCH

        SET @o_idEstadoDocumento = @IdEstadoNuevo;  -- v9.8: refleja estado final tras auto-aprobaciones
        SET @o_error = NULL;
        RETURN 0;
    END

    -- ======================================================
    -- FASE 2B: validaciones para instancia existente
    -- ======================================================
    IF @IdInstancia IS NULL
    BEGIN
        SET @o_error = 'No existe instancia activa para este documento.';
        RETURN -6;
    END

    SELECT TOP 1
        @CorrActorPaso           = CORR_ACTOR_ORIGEN,
        @CorrActorDestinoPaso    = CORR_ACTOR_DESTINO,
        @IdEstadoOrigen          = CORR_ESTADO_ORIGEN,
        @OrdenPasoActual         = ORDEN,
        @UnidadPasoActual        = CORR_UNIDAD_DESTINO
    FROM dbo.SEG_FLUJO_PASO
    WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @IdPasoActual;

    -- Cargar flujo actual desde la instancia (necesario antes de consultar
    -- SEG_FLUJO_PASO_ACCION_ESTADO que filtra tambien por CORR_FLUJO_PROCESO)
    SELECT @IdFlujoActual = CORR_FLUJO_PROCESO
    FROM dbo.SEG_FLUJO_INSTANCIA
    WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_INSTANCIA = @IdInstancia;

    -- v9.7: inferir CORR_ESTADO_ORIGEN desde la accion AVANZA que conduce a este paso.
    -- Solo aplica cuando es NULL (pasos ORDEN>1). El paso inicial siempre lo tiene seteado.
    IF @IdEstadoOrigen IS NULL
        SELECT TOP 1 @IdEstadoOrigen = pae.CORR_ESTADO_DESTINO
        FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO pae
        WHERE pae.CORR_EMPRESA         = @EmpresaEjecucion
          AND pae.CORR_FLUJO_PROCESO   = @IdFlujoActual
          AND pae.CORR_TIPO_MOVIMIENTO = 1              -- AVANZA
          AND pae.CORR_PASO_DESTINO    = @IdPasoActual  -- apunta a este paso
          AND pae.ACTIVO               = 1;

    DECLARE @TipoResActorPaso VARCHAR(30);
    SET @TipoResActorPaso = dbo.SEG_FN_ObtenerTipoResolucionActor(@EmpresaEjecucion, @CorrActorPaso);

    IF @TipoResActorPaso IN ('JEFE_UNIDAD', 'JEFE_INMEDIATO')
        SET @UnidadValidacion = @i_idUnidadDocumento;
    ELSE
        -- MANUAL: usa unidad del paso; NULL = cualquier asignacion activa del actor (v9.5)
        SET @UnidadValidacion = @UnidadPasoActual;

    -- v9.6: validacion de estado completamente inferida desde SEG_FLUJO_PASO_ACCION_ESTADO.
    -- Un estado distinto a CORR_ESTADO_ORIGEN es valido si:
    --   (A) llego via RETORNA de otro paso: es CORR_ESTADO_DESTINO de una accion
    --       TIPO_MOV=2 cuyo CORR_PASO_DESTINO apunta al paso actual.
    --   (B) llego via MANTIENE del mismo paso: es CORR_ESTADO_DESTINO de una
    --       accion TIPO_MOV=4 del paso actual (ej: "En Espera").
    -- Elimina CORR_ESTADO_ORIGEN_ALT; soporta N estados de re-entrada automaticamente.

    SET @EstadoEsOrigenAlt = 0;

    -- (A) Estado puesto por un RETORNA de otro paso que apunta aqui
    IF EXISTS (
        SELECT 1
        FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
        WHERE CORR_EMPRESA         = @EmpresaEjecucion
          AND CORR_FLUJO_PROCESO   = @IdFlujoActual
          AND CORR_TIPO_MOVIMIENTO = 2              -- RETORNA
          AND CORR_PASO_DESTINO    = @IdPasoActual  -- apunta a este paso
          AND CORR_ESTADO_DESTINO  = @IdEstadoActual
          AND ACTIVO               = 1
    )
        SET @EstadoEsOrigenAlt = 1;

    -- (B) Estado puesto por un MANTIENE del mismo paso (ej: ESPERA, EN REVISION)
    IF @EstadoEsOrigenAlt = 0
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
            WHERE CORR_EMPRESA         = @EmpresaEjecucion
              AND CORR_FLUJO_PROCESO   = @IdFlujoActual
              AND CORR_PASO            = @IdPasoActual
              AND CORR_TIPO_MOVIMIENTO = 4
              AND CORR_ESTADO_DESTINO  = @IdEstadoActual
              AND ACTIVO               = 1
        )
            SET @EstadoEsOrigenAlt = 1;
    END

    IF @IdEstadoActual <> @IdEstadoOrigen AND @EstadoEsOrigenAlt = 0
    BEGIN
        SET @o_error = 'El documento no esta en el estado esperado para esta accion. '
                     + 'Estado actual: ' + CAST(@IdEstadoActual AS VARCHAR)
                     + ', Estado origen esperado: ' + CAST(@IdEstadoOrigen AS VARCHAR) + '.';
        RETURN -7;
    END

    -- Validacion de ejecutor (multi-actor aware)
    SET @AutorizadoEjecutor = dbo.SEG_FN_UsuarioMatchActorUnidad(
        @i_login, @CorrActorPaso, @UnidadValidacion, @EmpresaEjecucion
    );

    IF @AutorizadoEjecutor = 0
    BEGIN
        SELECT TOP 1 @PrevPaso = CORR_PASO
        FROM dbo.SEG_FLUJO_PASO
        WHERE CORR_EMPRESA       = @EmpresaEjecucion
          AND CORR_FLUJO_PROCESO = @IdFlujoActual
          AND ORDEN              < @OrdenPasoActual
        ORDER BY ORDEN DESC;

        IF @PrevPaso IS NOT NULL
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM dbo.SEG_FLUJO_PASO_ACTOR_DESTINO PAD
                WHERE PAD.CORR_EMPRESA = @EmpresaEjecucion
                  AND PAD.CORR_PASO    = @PrevPaso
                  AND PAD.ACTIVO       = 1
                  AND dbo.SEG_FN_UsuarioMatchActorUnidad(
                          @i_login,
                          PAD.CORR_ACTOR,
                          PAD.CORR_UNIDAD,  -- v9.5: NULL = cualquier asignacion activa del actor
                          @EmpresaEjecucion
                      ) = 1
            )
                SET @AutorizadoEjecutor = 1;
        END
    END

    IF @AutorizadoEjecutor = 0
    BEGIN
        SET @o_error = 'Usuario no autorizado para ejecutar este paso.';
        RETURN -8;
    END

    -- ======================================================
    -- v9.0: Validar accion + obtener TIPO_MOVIMIENTO, TIPO_NOTIFICACION
    -- y CORR_ESTADO_DESTINO en una sola consulta.
    -- Si no existe fila para (flujo, paso, accion) con ACTIVO=1
    -- se trata como PERMITIDO=0.
    -- ======================================================
        SELECT @PermitidoAccion     = PERMITIDO,
           @EstadoDestinoAccion = CORR_ESTADO_DESTINO,
           @TipoMovimiento      = CORR_TIPO_MOVIMIENTO,
           @TipoNotificacion    = CORR_TIPO_NOTIFICACION,
           @PasoDestinoConfig   = CORR_PASO_DESTINO
    FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
    WHERE CORR_EMPRESA       = @EmpresaEjecucion
      AND CORR_FLUJO_PROCESO = @IdFlujoActual
      AND CORR_PASO          = @IdPasoActual
      AND CORR_ACCION        = @i_idAccion
      AND ACTIVO             = 1;

    IF @PermitidoAccion IS NULL OR @PermitidoAccion = 0
    BEGIN
        SET @o_error = 'Accion ' + CAST(@i_idAccion AS VARCHAR) + ' no permitida en este paso (no configurada o PERMITIDO=0).';
        RETURN -14;
    END
    -- ======================================================
    -- FASE 3: determinar nuevo estado y siguiente paso
    -- v9.0: completamente basado en TIPO_MOVIMIENTO y CORR_PASO_DESTINO.
    -- ======================================================
    SET @IdEstadoNuevo = @EstadoDestinoAccion;

    IF @TipoMovimiento = 1  -- AVANZA
    BEGIN
        IF @PasoDestinoConfig IS NOT NULL
            SET @IdPasoNuevo = @PasoDestinoConfig;
        ELSE
            SELECT TOP 1 @IdPasoNuevo = CORR_PASO
            FROM dbo.SEG_FLUJO_PASO
            WHERE CORR_EMPRESA       = @EmpresaEjecucion
              AND CORR_FLUJO_PROCESO = @IdFlujoActual
              AND ORDEN              > @OrdenPasoActual
            ORDER BY ORDEN ASC;
    END
    ELSE IF @TipoMovimiento = 2  -- RETORNA
    BEGIN
        -- v9.6: CORR_PASO_DESTINO es la fuente unica. Si es NULL, cae al paso
        -- anterior por ORDEN (compatibilidad). CORR_PASO_RETORNO ya no se lee.
        IF @PasoDestinoConfig IS NOT NULL
            SET @IdPasoNuevo = @PasoDestinoConfig;
        ELSE
            SELECT TOP 1 @IdPasoNuevo = CORR_PASO
            FROM dbo.SEG_FLUJO_PASO
            WHERE CORR_EMPRESA       = @EmpresaEjecucion
              AND CORR_FLUJO_PROCESO = @IdFlujoActual
              AND ORDEN              < @OrdenPasoActual
            ORDER BY ORDEN DESC;
    END
    ELSE IF @TipoMovimiento = 3  -- FINALIZA
    BEGIN
        SET @IdPasoNuevo = NULL;  -- cierra la instancia
    END
    ELSE IF @TipoMovimiento = 4  -- MANTIENE (ESPERA)
    BEGIN
        SET @IdPasoNuevo = @IdPasoActual;  -- no cambia el paso
    END
    ELSE IF @TipoMovimiento = 5  -- ANTERIOR
    BEGIN
        SELECT TOP 1 @IdPasoNuevo = CORR_PASO
        FROM dbo.SEG_FLUJO_PASO
        WHERE CORR_EMPRESA       = @EmpresaEjecucion
          AND CORR_FLUJO_PROCESO = @IdFlujoActual
          AND ORDEN              < @OrdenPasoActual
        ORDER BY ORDEN DESC;
    END

    SELECT @LoginCreador = USUARIO_CREA
    FROM dbo.SEG_FLUJO_INSTANCIA
    WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_INSTANCIA = @IdInstancia;

    -- ======================================================
    -- FASE 4+5: registrar en bitacora y actualizar instancia
    -- ======================================================
    BEGIN TRY
        BEGIN TRAN;

        -- v9.1: calcular CORR_BITACORA con MAX+1 (sin IDENTITY)
        SELECT @NextCorrBitacora = ISNULL(MAX(CORR_BITACORA), 0) + 1
        FROM dbo.SEG_FLUJO_BITACORA
        WHERE CORR_EMPRESA = @EmpresaEjecucion;

        INSERT INTO dbo.SEG_FLUJO_BITACORA (
        CORR_EMPRESA, CORR_BITACORA, CORR_INSTANCIA, CORR_PASO,
        TIPO_USUARIO, LOGIN_SISTEMA, COMENTARIO,
        CORR_ESTADO_ANTERIOR, CORR_ESTADO_NUEVO,
        CORR_UNIDAD_EJECUTOR, USUARIO_CREA, ESTACION_CREA
        ) VALUES (
            @EmpresaEjecucion, @NextCorrBitacora, @IdInstancia, @IdPasoActual,
            @CorrActorPaso, @i_login, @i_Observacion,
            @IdEstadoActual, @IdEstadoNuevo,
            @i_idUnidadDocumento, @i_login, 'SP_EjecutarFlujo'
        );
        -- Punto 3 corregido (v9.1): marcar PROCESADO=1 en notificaciones anteriores del paso.
        --
        -- Para AVANZA / RETORNA / FINALIZA / ANTERIOR: se marcan TODAS las notifs del paso.
        --
        -- Para MANTIENE (tipo 4): en v9.0 no se marcaba ninguna, lo que acumulaba
        -- notificaciones de ciclos anteriores conviviendo activas con las nuevas.
        -- Correccion: se marcan las notifs YA EXISTENTES antes de este ciclo
        -- (FECHA_CREA < ahora), dejando abiertas solo las que se van a generar ahora.
        -- Esto soporta multiples ciclos MANTIENE consecutivos sin acumulacion.
        DECLARE @FechaCorteProcessado DATETIME = GETDATE();

        IF @TipoMovimiento <> 4
        BEGIN
            -- No es MANTIENE: cerrar todas las notifs del paso sin excepcion
            UPDATE dbo.SEG_FLUJO_NOTIFICACION
            SET PROCESADO    = 1,
                USUARIO_ACTU = @i_login,
                FECHA_ACTU   = GETDATE()
            WHERE CORR_EMPRESA   = @EmpresaEjecucion
              AND CORR_INSTANCIA = @IdInstancia
              AND CORR_PASO      = @IdPasoActual;

            -- Cerrar tambien las notificaciones informativas (TIPO_NOT=3 CREADOR)
            -- que apuntan al ejecutor actual pero pertenecen a pasos anteriores.
            -- Esto ocurre cuando una notif de tipo CREADOR fue generada en un paso
            -- anterior indicando "ve al paso X a ejecutar", y el usuario ya ejecuto
            -- ese paso destino. Sin este UPDATE quedarian en PROCESADO=0 para siempre.
            UPDATE dbo.SEG_FLUJO_NOTIFICACION
            SET PROCESADO    = 1,
                USUARIO_ACTU = @i_login,
                FECHA_ACTU   = GETDATE()
            WHERE CORR_EMPRESA         = @EmpresaEjecucion
              AND CORR_INSTANCIA       = @IdInstancia
              AND LOGIN_SISTEMA_DESTINO = @i_login
              AND CORR_PASO            <> @IdPasoActual
              AND PROCESADO            = 0;
        END
        ELSE
        BEGIN
            -- MANTIENE: cerrar solo las notifs previas a este momento
            -- Las nuevas que se generen en FASE 6 quedan abiertas (PROCESADO=0)
            UPDATE dbo.SEG_FLUJO_NOTIFICACION
            SET PROCESADO    = 1,
                USUARIO_ACTU = @i_login,
                FECHA_ACTU   = GETDATE()
            WHERE CORR_EMPRESA   = @EmpresaEjecucion
              AND CORR_INSTANCIA = @IdInstancia
              AND CORR_PASO      = @IdPasoActual
              AND PROCESADO      = 0
              AND FECHA_CREA     < @FechaCorteProcessado;
        END

        -- Actualizar instancia segun el movimiento
        IF @TipoMovimiento = 4  -- MANTIENE: solo cambia estado, NO el paso
        BEGIN
            UPDATE dbo.SEG_FLUJO_INSTANCIA
            SET CORR_ESTADO_ACTUAL = @IdEstadoNuevo,
                USUARIO_ACTU       = @i_login,
                ESTACION_ACTU      = 'SP_EjecutarFlujo',
                FECHA_ACTU         = GETDATE()
            WHERE CORR_EMPRESA   = @EmpresaEjecucion
              AND CORR_INSTANCIA = @IdInstancia;
        END
        ELSE IF @TipoMovimiento = 3  -- FINALIZA: cierra la instancia
        BEGIN
            UPDATE dbo.SEG_FLUJO_INSTANCIA
            SET ACTIVO             = 0,
                FECHA_FIN          = GETDATE(),
                CORR_ESTADO_ACTUAL = @IdEstadoNuevo,
                CORR_PASO_ACTUAL   = NULL,
                USUARIO_ACTU       = @i_login,
                ESTACION_ACTU      = 'SP_EjecutarFlujo',
                FECHA_ACTU         = GETDATE()
            WHERE CORR_EMPRESA   = @EmpresaEjecucion
              AND CORR_INSTANCIA = @IdInstancia;
        END
        ELSE  -- AVANZA, RETORNA, ANTERIOR: mueve al nuevo paso
        BEGIN
            UPDATE dbo.SEG_FLUJO_INSTANCIA
            SET CORR_PASO_ACTUAL   = @IdPasoNuevo,
                CORR_ESTADO_ACTUAL = @IdEstadoNuevo,
                USUARIO_ACTU       = @i_login,
                ESTACION_ACTU      = 'SP_EjecutarFlujo',
                FECHA_ACTU         = GETDATE()
            WHERE CORR_EMPRESA   = @EmpresaEjecucion
              AND CORR_INSTANCIA = @IdInstancia;
        END

        -- ======================================================
        -- FASE 6: notificar segun TIPO_NOTIFICACION
        --
        --   1=ACTUAL    -> destinatarios del paso ACTUAL
        --                  (el mismo paso donde se ejecuto la accion,
        --                   util para MANTIENE: avisa a quienes esperaban)
        --   2=SIGUIENTE -> destinatarios del paso NUEVO (principal + multi-actor
        --                  del paso que SE ACABA DE ejecutar)
        --   3=CREADOR   -> al LOGIN_SISTEMA de la instancia (USUARIO_CREA)
        --   4=ANTERIOR  -> destinatarios del paso anterior por ORDEN
        --   5=NO NOTIFICA -> no se genera ninguna notificacion
        -- ======================================================
        SET @MensajeNotifEnvio = N'Tarea pendiente en el flujo.';

        IF @TipoNotificacion = 1  -- ACTUAL
        BEGIN
            -- Notificar a los destinatarios del paso actual
            -- (destino principal del paso + multi-actor del paso actual)
            SET @CorrActorDestinoNuevo = @CorrActorDestinoPaso;
            SET @UnidadPasoNuevo = @UnidadPasoActual;
            -- v9.3: inferir unidad desde asignaciones cuando CORR_UNIDAD_DESTINO es NULL
            IF @UnidadPasoNuevo IS NULL
            BEGIN
                SET @UnidadPasoNuevo = dbo.SEG_FN_InferirUnidadActor(@EmpresaEjecucion, @CorrActorDestinoPaso);
                IF @UnidadPasoNuevo IS NULL SET @UnidadPasoNuevo = @i_idUnidadDocumento;
            END

            DELETE FROM @YaNotificados;

            -- 1) Principal
            DELETE FROM @Destinatarios;
            DELETE FROM @DestRaw;
            INSERT INTO @DestRaw (LoginDestino)
            EXEC dbo.SEG_SP_ResolverDestinatariosPaso
                @CORR_EMPRESA        = @EmpresaEjecucion,
                @CORR_PASO           = @IdPasoActual,
                @UnidadDocumento     = @i_idUnidadDocumento,
                @LoginEjecutor       = NULL,
                @CORR_ACTOR_OVERRIDE = @CorrActorDestinoPaso;
            INSERT INTO @Destinatarios (RowNum, LoginDestino)
            SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), LoginDestino FROM @DestRaw;

            IF NOT EXISTS (SELECT 1 FROM @Destinatarios)
                THROW 50009, 'No se encontraron destinatarios para notificar (TIPO=ACTUAL).', 1;

            SELECT @RowNum = 1, @MaxRowNum = COUNT(*) FROM @Destinatarios;
            WHILE @RowNum <= @MaxRowNum
            BEGIN
                SELECT @LoginDestino = LoginDestino FROM @Destinatarios WHERE RowNum = @RowNum;

                EXEC dbo.GenerarNotificacionesFlujo
                    @i_CORR_EMPRESA          = @EmpresaEjecucion,
                    @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                    @i_CORR_DOCUMENTO        = @i_idDocumento,
                    @i_CORR_INSTANCIA        = @IdInstancia,
                    @i_CORR_PASO             = @IdPasoActual,
                    @i_CORR_ACTOR_DESTINO    = @CorrActorDestinoNuevo,
                    @i_CORR_UNIDAD           = @UnidadPasoNuevo,
                    @i_MENSAJE               = @MensajeNotifEnvio,
                    @i_LOGIN_USUARIO_DESTINO = @LoginDestino,
                    @i_LOGIN_EJECUTOR        = @i_login,
                    @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                    @i_CORR_ESTADO           = @IdEstadoNuevo,
                    @i_CORR_PASO_EJECUTOR    = @IdPasoActual,
                    @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                    @o_ERROR                 = @ErrorNotificacion OUTPUT;

                IF @ErrorNotificacion IS NOT NULL
                    THROW 50009, @ErrorNotificacion, 1;

                IF NOT EXISTS (SELECT 1 FROM @YaNotificados WHERE LoginDestino = @LoginDestino)
                    INSERT INTO @YaNotificados (LoginDestino) VALUES (@LoginDestino);

                SET @RowNum = @RowNum + 1;
            END

            -- 2) Multi-actor del paso actual
            SET @MA_Default_Unidad = @UnidadPasoNuevo;

            DELETE FROM @MultiDest;
            INSERT INTO @MultiDest (RowNum, CorrActor, CorrUnidad)
            SELECT ROW_NUMBER() OVER (ORDER BY ORDEN, CORR_PASO_ACTOR_DESTINO),
                   CORR_ACTOR, CORR_UNIDAD  -- v9.5: NULL = todos los usuarios del actor
            FROM dbo.SEG_FLUJO_PASO_ACTOR_DESTINO
            WHERE CORR_EMPRESA = @EmpresaEjecucion
              AND CORR_PASO    = @IdPasoActual
              AND ACTIVO       = 1;

            SELECT @MA_Iter = 1, @MA_Total = COUNT(*) FROM @MultiDest;
            WHILE @MA_Iter <= @MA_Total
            BEGIN
                SELECT @MA_CorrActor = CorrActor, @MA_CorrUnidad = CorrUnidad
                FROM @MultiDest WHERE RowNum = @MA_Iter;
                -- v9.5: calcular unidad efectiva para metadata
                SET @MA_UnidadMeta = ISNULL(@MA_CorrUnidad, @i_idUnidadDocumento);

                DELETE FROM @Destinatarios;
                DELETE FROM @DestRaw;
                INSERT INTO @DestRaw (LoginDestino)
                EXEC dbo.SEG_SP_ResolverDestinatariosPaso
                    @CORR_EMPRESA         = @EmpresaEjecucion,
                    @CORR_PASO            = @IdPasoActual,
                    @UnidadDocumento      = @i_idUnidadDocumento,
                    @LoginEjecutor        = NULL,
                    @CORR_ACTOR_OVERRIDE  = @MA_CorrActor,
                    @CORR_UNIDAD_OVERRIDE = @MA_CorrUnidad;
                INSERT INTO @Destinatarios (RowNum, LoginDestino)
                SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), LoginDestino
                FROM @DestRaw
                WHERE LoginDestino NOT IN (SELECT LoginDestino FROM @YaNotificados);

                SELECT @RowNum = 1, @MaxRowNum = COUNT(*) FROM @Destinatarios;
                WHILE @RowNum <= @MaxRowNum
                BEGIN
                    SELECT @LoginDestino = LoginDestino FROM @Destinatarios WHERE RowNum = @RowNum;

                    EXEC dbo.GenerarNotificacionesFlujo
                        @i_CORR_EMPRESA          = @EmpresaEjecucion,
                        @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                        @i_CORR_DOCUMENTO        = @i_idDocumento,
                        @i_CORR_INSTANCIA        = @IdInstancia,
                        @i_CORR_PASO             = @IdPasoActual,
                        @i_CORR_ACTOR_DESTINO    = @MA_CorrActor,
                        @i_CORR_UNIDAD           = @MA_UnidadMeta,  -- v9.5: metadata no-NULL
                        @i_MENSAJE               = @MensajeNotifEnvio,
                        @i_LOGIN_USUARIO_DESTINO = @LoginDestino,
                        @i_LOGIN_EJECUTOR        = @i_login,
                        @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                        @i_CORR_ESTADO           = @IdEstadoNuevo,
                        @i_CORR_PASO_EJECUTOR    = @IdPasoActual,
                        @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                        @o_ERROR                 = @ErrorNotificacion OUTPUT;

                    IF @ErrorNotificacion IS NOT NULL
                        THROW 50010, @ErrorNotificacion, 1;

                    IF NOT EXISTS (SELECT 1 FROM @YaNotificados WHERE LoginDestino = @LoginDestino)
                        INSERT INTO @YaNotificados (LoginDestino) VALUES (@LoginDestino);

                    SET @RowNum = @RowNum + 1;
                END

                SET @MA_Iter = @MA_Iter + 1;
            END
        END
        ELSE IF @TipoNotificacion = 2  -- SIGUIENTE
        BEGIN
            -- Notificar a los destinatarios del paso nuevo
            -- (destino principal + multi-actor del paso que SE ACABO DE ejecutar)
            IF @IdPasoNuevo IS NOT NULL
            BEGIN
                  SELECT @CorrActorPasoNuevo    = CORR_ACTOR_ORIGEN,
                       @CorrActorDestinoNuevo = CORR_ACTOR_DESTINO,
                       @UnidadPasoNuevo       = CORR_UNIDAD_DESTINO
                FROM dbo.SEG_FLUJO_PASO
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @IdPasoNuevo;

                -- v9.3: inferir unidad desde asignaciones cuando CORR_UNIDAD_DESTINO es NULL
                IF @UnidadPasoNuevo IS NULL
                BEGIN
                    -- Para SIGUIENTE: la unidad que importa es la del actor destino (quien recibe)
                    DECLARE @ActorParaInferirSig INT = ISNULL(@CorrActorDestinoPaso, @CorrActorPasoNuevo);
                    SET @UnidadPasoNuevo = dbo.SEG_FN_InferirUnidadActor(@EmpresaEjecucion, @ActorParaInferirSig);
                    IF @UnidadPasoNuevo IS NULL SET @UnidadPasoNuevo = @i_idUnidadDocumento;
                END
                SET @CorrActorDestinoNuevo = @CorrActorPasoNuevo;
                IF @CorrActorDestinoPaso IS NOT NULL SET @CorrActorDestinoNuevo = @CorrActorDestinoPaso;

                DELETE FROM @YaNotificados;

                -- v9.8: pre-verificar si el ejecutor auto-aprobara el siguiente paso
                SET @AutoPermite = 0; SET @AutoActorPaso = NULL; SET @AutoUnidadPaso = NULL;
                SELECT @AutoPermite = ISNULL(PERMITE_AUTO_APROBACION, 0),
                       @AutoActorPaso = CORR_ACTOR_ORIGEN, @AutoUnidadPaso = CORR_UNIDAD_DESTINO
                FROM dbo.SEG_FLUJO_PASO
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @IdPasoNuevo;
                IF @AutoPermite = 1
                BEGIN
                    SET @AutoTipoResActor = dbo.SEG_FN_ObtenerTipoResolucionActor(@EmpresaEjecucion, @AutoActorPaso);
                    IF @AutoTipoResActor IN ('JEFE_UNIDAD', 'JEFE_INMEDIATO') SET @AutoUnidadValidacion = @i_idUnidadDocumento;
                    ELSE SET @AutoUnidadValidacion = @AutoUnidadPaso;
                    IF dbo.SEG_FN_UsuarioMatchActorUnidad(@i_login, @AutoActorPaso, @AutoUnidadValidacion, @EmpresaEjecucion) = 0
                        SET @AutoPermite = 0;  -- No auto-aprobara: mantenerlo en las notificaciones
                END

                -- 1) Principal
                DELETE FROM @Destinatarios;
                DELETE FROM @DestRaw;
                INSERT INTO @DestRaw (LoginDestino)
                EXEC dbo.SEG_SP_ResolverDestinatariosPaso
                    @CORR_EMPRESA         = @EmpresaEjecucion,
                    @CORR_PASO            = @IdPasoNuevo,
                    @UnidadDocumento      = @i_idUnidadDocumento,
                    @LoginEjecutor        = NULL,
                    @CORR_ACTOR_OVERRIDE  = @CorrActorDestinoPaso,
                    @CORR_UNIDAD_OVERRIDE = @UnidadPasoActual;  -- v9.4: CORR_UNIDAD_DESTINO del paso actual aplica al actor destino
                IF @AutoPermite = 1 DELETE FROM @DestRaw WHERE LoginDestino = @i_login;
                INSERT INTO @Destinatarios (RowNum, LoginDestino)
                SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), LoginDestino FROM @DestRaw;

                IF @AutoPermite = 0 AND NOT EXISTS (SELECT 1 FROM @Destinatarios)
                    THROW 50003, 'No se encontraron destinatarios para el siguiente paso.', 1;

                SELECT @RowNum = 1, @MaxRowNum = COUNT(*) FROM @Destinatarios;
                WHILE @RowNum <= @MaxRowNum
                BEGIN
                    SELECT @LoginDestino = LoginDestino FROM @Destinatarios WHERE RowNum = @RowNum;

                    EXEC dbo.GenerarNotificacionesFlujo
                        @i_CORR_EMPRESA          = @EmpresaEjecucion,
                        @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                        @i_CORR_DOCUMENTO        = @i_idDocumento,
                        @i_CORR_INSTANCIA        = @IdInstancia,
                        @i_CORR_PASO             = @IdPasoNuevo,
                        @i_CORR_ACTOR_DESTINO    = @CorrActorDestinoNuevo,
                        @i_CORR_UNIDAD           = @UnidadPasoNuevo,
                        @i_MENSAJE               = @MensajeNotifEnvio,
                        @i_LOGIN_USUARIO_DESTINO = @LoginDestino,
                        @i_LOGIN_EJECUTOR        = @i_login,
                        @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                        @i_CORR_ESTADO           = @IdEstadoNuevo,
                        @i_CORR_PASO_EJECUTOR    = @IdPasoActual,
                        @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                        @o_ERROR                 = @ErrorNotificacion OUTPUT;

                    IF @ErrorNotificacion IS NOT NULL
                        THROW 50002, @ErrorNotificacion, 1;

                    IF NOT EXISTS (SELECT 1 FROM @YaNotificados WHERE LoginDestino = @LoginDestino)
                        INSERT INTO @YaNotificados (LoginDestino) VALUES (@LoginDestino);

                    SET @RowNum = @RowNum + 1;
                END

                -- 2) Multi-actor del paso actual (que se acaba de aprobar)
                SET @MA_Default_Unidad = @UnidadPasoNuevo;

                DELETE FROM @MultiDest;
                INSERT INTO @MultiDest (RowNum, CorrActor, CorrUnidad)
                SELECT ROW_NUMBER() OVER (ORDER BY ORDEN, CORR_PASO_ACTOR_DESTINO),
                       CORR_ACTOR, CORR_UNIDAD  -- v9.5: NULL = todos los usuarios del actor
                FROM dbo.SEG_FLUJO_PASO_ACTOR_DESTINO
                WHERE CORR_EMPRESA = @EmpresaEjecucion
                  AND CORR_PASO    = @IdPasoActual
                  AND ACTIVO       = 1;

                SELECT @MA_Iter = 1, @MA_Total = COUNT(*) FROM @MultiDest;
                WHILE @MA_Iter <= @MA_Total
                BEGIN
                    SELECT @MA_CorrActor = CorrActor, @MA_CorrUnidad = CorrUnidad
                    FROM @MultiDest WHERE RowNum = @MA_Iter;
                    -- v9.5: calcular unidad efectiva para metadata
                    SET @MA_UnidadMeta = ISNULL(@MA_CorrUnidad, @i_idUnidadDocumento);

                    DELETE FROM @Destinatarios;
                    DELETE FROM @DestRaw;
                    INSERT INTO @DestRaw (LoginDestino)
                    EXEC dbo.SEG_SP_ResolverDestinatariosPaso
                        @CORR_EMPRESA         = @EmpresaEjecucion,
                        @CORR_PASO            = @IdPasoNuevo,
                        @UnidadDocumento      = @i_idUnidadDocumento,
                        @LoginEjecutor        = NULL,
                        @CORR_ACTOR_OVERRIDE  = @MA_CorrActor,
                        @CORR_UNIDAD_OVERRIDE = @MA_CorrUnidad;
                    -- v9.8: excluir ejecutor si auto-aprobara el siguiente paso
                    IF @AutoPermite = 1 DELETE FROM @DestRaw WHERE LoginDestino = @i_login;
                    INSERT INTO @Destinatarios (RowNum, LoginDestino)
                    SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), LoginDestino
                    FROM @DestRaw
                    WHERE LoginDestino NOT IN (SELECT LoginDestino FROM @YaNotificados);

                    SELECT @RowNum = 1, @MaxRowNum = COUNT(*) FROM @Destinatarios;
                    WHILE @RowNum <= @MaxRowNum
                    BEGIN
                        SELECT @LoginDestino = LoginDestino FROM @Destinatarios WHERE RowNum = @RowNum;

                        EXEC dbo.GenerarNotificacionesFlujo
                            @i_CORR_EMPRESA          = @EmpresaEjecucion,
                            @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                            @i_CORR_DOCUMENTO        = @i_idDocumento,
                            @i_CORR_INSTANCIA        = @IdInstancia,
                            @i_CORR_PASO             = @IdPasoNuevo,
                            @i_CORR_ACTOR_DESTINO    = @MA_CorrActor,
                            @i_CORR_UNIDAD           = @MA_UnidadMeta,  -- v9.5: metadata no-NULL
                            @i_MENSAJE               = @MensajeNotifEnvio,
                            @i_LOGIN_USUARIO_DESTINO = @LoginDestino,
                            @i_LOGIN_EJECUTOR        = @i_login,
                            @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                            @i_CORR_ESTADO           = @IdEstadoNuevo,
                            @i_CORR_PASO_EJECUTOR    = @IdPasoActual,
                            @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                            @o_ERROR                 = @ErrorNotificacion OUTPUT;

                        IF @ErrorNotificacion IS NOT NULL
                            THROW 50008, @ErrorNotificacion, 1;

                        IF NOT EXISTS (SELECT 1 FROM @YaNotificados WHERE LoginDestino = @LoginDestino)
                            INSERT INTO @YaNotificados (LoginDestino) VALUES (@LoginDestino);

                        SET @RowNum = @RowNum + 1;
                    END

                    SET @MA_Iter = @MA_Iter + 1;
                END
            END
            ELSE
            BEGIN
                -- TIPO_NOTIFICACION=2 pero @IdPasoNuevo=NULL (FINALIZA);
                -- notificar al creador como fallback razonable.
                SET @ActorNotifDirecta  = @CorrActorPaso;
                IF @CorrActorDestinoPaso IS NOT NULL SET @ActorNotifDirecta = @CorrActorDestinoPaso;
                SET @UnidadNotifDirecta = @i_idUnidadDocumento;

                EXEC dbo.GenerarNotificacionesFlujo
                    @i_CORR_EMPRESA          = @EmpresaEjecucion,
                    @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                    @i_CORR_DOCUMENTO        = @i_idDocumento,
                    @i_CORR_INSTANCIA        = @IdInstancia,
                    @i_CORR_PASO             = @IdPasoActual,
                    @i_CORR_ACTOR_DESTINO    = @ActorNotifDirecta,
                    @i_CORR_UNIDAD           = @UnidadNotifDirecta,
                    @i_MENSAJE               = @MensajeNotifEnvio,
                    @i_LOGIN_USUARIO_DESTINO = @LoginCreador,
                    @i_LOGIN_EJECUTOR        = @i_login,
                    @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                    @i_CORR_ESTADO           = @IdEstadoNuevo,
                    @i_CORR_PASO_EJECUTOR    = @IdPasoActual,
                    @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                    @o_ERROR                 = @ErrorNotificacion OUTPUT;

                IF @ErrorNotificacion IS NOT NULL
                    THROW 50004, @ErrorNotificacion, 1;
            END
        END
        ELSE IF @TipoNotificacion = 3  -- CREADOR
        BEGIN
            SET @ActorNotifDirecta  = @CorrActorPaso;
            IF @CorrActorDestinoPaso IS NOT NULL SET @ActorNotifDirecta = @CorrActorDestinoPaso;
            SET @UnidadNotifDirecta = @i_idUnidadDocumento;

            EXEC dbo.GenerarNotificacionesFlujo
                @i_CORR_EMPRESA          = @EmpresaEjecucion,
                @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                @i_CORR_DOCUMENTO        = @i_idDocumento,
                @i_CORR_INSTANCIA        = @IdInstancia,
                @i_CORR_PASO             = @IdPasoActual,
                @i_CORR_ACTOR_DESTINO    = @ActorNotifDirecta,
                @i_CORR_UNIDAD           = @UnidadNotifDirecta,
                @i_MENSAJE               = @MensajeNotifEnvio,
                @i_LOGIN_USUARIO_DESTINO = @LoginCreador,
                @i_LOGIN_EJECUTOR        = @i_login,
                @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                @i_CORR_ESTADO           = @IdEstadoNuevo,
                @i_CORR_PASO_EJECUTOR    = @IdPasoActual,
                @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                @o_ERROR                 = @ErrorNotificacion OUTPUT;

            IF @ErrorNotificacion IS NOT NULL
                THROW 50005, @ErrorNotificacion, 1;
        END
        ELSE IF @TipoNotificacion = 4  -- ANTERIOR
        BEGIN
            -- Notificar a destinatarios del paso anterior por ORDEN.
            -- Util para flujos futuros con notificacion hacia atras.
            SET @PasoNotif = NULL;
            SELECT TOP 1 @PasoNotif = CORR_PASO
            FROM dbo.SEG_FLUJO_PASO
            WHERE CORR_EMPRESA       = @EmpresaEjecucion
              AND CORR_FLUJO_PROCESO = @IdFlujoActual
              AND ORDEN              < @OrdenPasoActual
            ORDER BY ORDEN DESC;

            IF @PasoNotif IS NOT NULL
            BEGIN
                  SELECT @CorrActorPasoNuevo    = CORR_ACTOR_ORIGEN,
                       @CorrActorDestinoNuevo = CORR_ACTOR_DESTINO,
                       @UnidadPasoNuevo       = CORR_UNIDAD_DESTINO
                FROM dbo.SEG_FLUJO_PASO
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @PasoNotif;

                -- v9.3: inferir unidad desde asignaciones cuando CORR_UNIDAD_DESTINO es NULL
                IF @UnidadPasoNuevo IS NULL
                BEGIN
                    SET @UnidadPasoNuevo = dbo.SEG_FN_InferirUnidadActor(@EmpresaEjecucion, @CorrActorPasoNuevo);
                    IF @UnidadPasoNuevo IS NULL SET @UnidadPasoNuevo = @i_idUnidadDocumento;
                END

                DELETE FROM @YaNotificados;
                DELETE FROM @Destinatarios;
                DELETE FROM @DestRaw;
                INSERT INTO @DestRaw (LoginDestino)
                EXEC dbo.SEG_SP_ResolverDestinatariosPaso
                    @CORR_EMPRESA        = @EmpresaEjecucion,
                    @CORR_PASO           = @PasoNotif,
                    @UnidadDocumento     = @i_idUnidadDocumento,
                    @LoginEjecutor       = NULL,
                    @CORR_ACTOR_OVERRIDE = @CorrActorDestinoNuevo;
                INSERT INTO @Destinatarios (RowNum, LoginDestino)
                SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), LoginDestino FROM @DestRaw;

                SELECT @RowNum = 1, @MaxRowNum = COUNT(*) FROM @Destinatarios;
                WHILE @RowNum <= @MaxRowNum
                BEGIN
                    SELECT @LoginDestino = LoginDestino FROM @Destinatarios WHERE RowNum = @RowNum;

                    EXEC dbo.GenerarNotificacionesFlujo
                        @i_CORR_EMPRESA          = @EmpresaEjecucion,
                        @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                        @i_CORR_DOCUMENTO        = @i_idDocumento,
                        @i_CORR_INSTANCIA        = @IdInstancia,
                        @i_CORR_PASO             = @PasoNotif,
                        @i_CORR_ACTOR_DESTINO    = @CorrActorDestinoNuevo,
                        @i_CORR_UNIDAD           = @UnidadPasoNuevo,
                        @i_MENSAJE               = @MensajeNotifEnvio,
                        @i_LOGIN_USUARIO_DESTINO = @LoginDestino,
                        @i_LOGIN_EJECUTOR        = @i_login,
                        @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                        @i_CORR_ESTADO           = @IdEstadoNuevo,
                        @i_CORR_PASO_EJECUTOR    = @IdPasoActual,
                        @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                        @o_ERROR                 = @ErrorNotificacion OUTPUT;

                    IF @ErrorNotificacion IS NOT NULL
                        THROW 50011, @ErrorNotificacion, 1;

                    SET @RowNum = @RowNum + 1;
                END
            END
        END
        ELSE IF @TipoNotificacion = 5  -- NO NOTIFICA
        BEGIN
            -- No se genera ninguna notificacion.
            -- La accion queda registrada en bitacora pero ningun usuario recibe aviso.
            -- Util para acciones internas, confirmaciones silenciosas o pasos
            -- donde el ejecutor ya conoce el resultado sin necesidad de notif.
            SET @IdNotificacionGenerada = @IdNotificacionGenerada; -- no-op intencional
        END

        -- Si el movimiento fue FINALIZA, cerrar todas las notificaciones pendientes
        -- de la instancia. Las notificaciones informativas generadas en este mismo
        -- paso (ej. "Permiso aceptado por el empleado" -> TH) no tendran una accion
        -- futura que las procese, por lo que se marcan PROCESADO=1 aqui mismo.
        IF @TipoMovimiento = 3  -- FINALIZA
        BEGIN
            UPDATE dbo.SEG_FLUJO_NOTIFICACION
            SET PROCESADO    = 1,
                USUARIO_ACTU = @i_login,
                FECHA_ACTU   = GETDATE()
            WHERE CORR_EMPRESA   = @EmpresaEjecucion
              AND CORR_INSTANCIA = @IdInstancia
              AND PROCESADO      = 0;
        END

        -- ======================================================
        -- FASE 7: Auto-aprobacion en cadena (v9.8)
        --
        -- Si @IdPasoNuevo tiene PERMITE_AUTO_APROBACION=1 y el
        -- ejecutor (@i_login) satisface su actor, se ejecuta
        -- automaticamente la accion AVANZA de ese paso.
        -- Continua en cadena hasta 5 niveles o hasta que no aplique.
        -- Solo actua cuando el paso actual AVANZO (TIPO_MOV=1).
        -- ======================================================
        SET @AutoAprobCount      = 0;
        SET @MaxAutoAprobaciones = 5;

        WHILE @IdPasoNuevo IS NOT NULL
          AND @TipoMovimiento = 1
          AND @AutoAprobCount < @MaxAutoAprobaciones
        BEGIN
            -- 1. ¿El paso siguiente permite auto-aprobacion?
            SET @AutoPermite          = 0;
            SET @AutoActorPaso        = NULL;
            SET @AutoActorDestinoPaso = NULL;
            SET @AutoUnidadPaso       = NULL;
            SET @AutoOrden            = NULL;

            SELECT @AutoPermite          = ISNULL(PERMITE_AUTO_APROBACION, 0),
                   @AutoActorPaso        = CORR_ACTOR_ORIGEN,
                   @AutoActorDestinoPaso = CORR_ACTOR_DESTINO,
                   @AutoUnidadPaso       = CORR_UNIDAD_DESTINO,
                   @AutoOrden            = ORDEN
            FROM dbo.SEG_FLUJO_PASO
            WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @IdPasoNuevo;

            IF @AutoPermite = 0 BREAK;

            -- 2. ¿@i_login satisface el actor del paso siguiente?
            SET @AutoTipoResActor = dbo.SEG_FN_ObtenerTipoResolucionActor(@EmpresaEjecucion, @AutoActorPaso);

            IF @AutoTipoResActor IN ('JEFE_UNIDAD', 'JEFE_INMEDIATO')
                SET @AutoUnidadValidacion = @i_idUnidadDocumento;
            ELSE
                SET @AutoUnidadValidacion = @AutoUnidadPaso;

            IF dbo.SEG_FN_UsuarioMatchActorUnidad(@i_login, @AutoActorPaso, @AutoUnidadValidacion, @EmpresaEjecucion) = 0
                BREAK;

            -- 3. Buscar la accion AVANZA configurada en el paso siguiente
            SET @AutoAccion = NULL;
            SELECT TOP 1
                @AutoAccion         = CORR_ACCION,
                @AutoEstadoDestino2 = CORR_ESTADO_DESTINO,
                @AutoTipoNotif2     = CORR_TIPO_NOTIFICACION,
                @AutoTipoMov2       = CORR_TIPO_MOVIMIENTO,
                @AutoPasoDestino2   = CORR_PASO_DESTINO
            FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
            WHERE CORR_EMPRESA         = @EmpresaEjecucion
              AND CORR_FLUJO_PROCESO   = @IdFlujoActual
              AND CORR_PASO            = @IdPasoNuevo
              AND CORR_TIPO_MOVIMIENTO = 1   -- buscar la accion que AVANZA
              AND ACTIVO               = 1
            ORDER BY CORR_ACCION;

            IF @AutoAccion IS NULL BREAK;

            -- 4. Determinar el paso resultante tras la auto-aprobacion
            SET @AutoIdPasoNuevo = NULL;
            IF @AutoPasoDestino2 IS NOT NULL
                SET @AutoIdPasoNuevo = @AutoPasoDestino2;
            ELSE IF @AutoTipoMov2 = 1
                SELECT TOP 1 @AutoIdPasoNuevo = CORR_PASO
                FROM dbo.SEG_FLUJO_PASO
                WHERE CORR_EMPRESA       = @EmpresaEjecucion
                  AND CORR_FLUJO_PROCESO = @IdFlujoActual
                  AND ORDEN              > @AutoOrden
                ORDER BY ORDEN ASC;
            -- Si FINALIZA (3): @AutoIdPasoNuevo queda NULL

            -- 5. Registrar en bitacora con observacion [AUTO]
            SET @AutoEstadoAnterior = @IdEstadoNuevo;

            SELECT @NextCorrBitacora = ISNULL(MAX(CORR_BITACORA), 0) + 1
            FROM dbo.SEG_FLUJO_BITACORA WHERE CORR_EMPRESA = @EmpresaEjecucion;

            INSERT INTO dbo.SEG_FLUJO_BITACORA (
                CORR_EMPRESA, CORR_BITACORA, CORR_INSTANCIA, CORR_PASO,
                TIPO_USUARIO, LOGIN_SISTEMA, COMENTARIO,
                CORR_ESTADO_ANTERIOR, CORR_ESTADO_NUEVO,
                CORR_UNIDAD_EJECUTOR, USUARIO_CREA, ESTACION_CREA
            ) VALUES (
                @EmpresaEjecucion, @NextCorrBitacora, @IdInstancia, @IdPasoNuevo,
                @AutoActorPaso, @i_login,
                N'[AUTO] Paso ejecutado automaticamente: el ejecutor satisface el actor del paso',
                @AutoEstadoAnterior, @AutoEstadoDestino2,
                @i_idUnidadDocumento, @i_login, 'SP_EjecutarFlujo'
            );

            -- 6. Marcar notificaciones pendientes del ejecutor como procesadas
            UPDATE dbo.SEG_FLUJO_NOTIFICACION
            SET PROCESADO    = 1,
                USUARIO_ACTU = @i_login,
                FECHA_ACTU   = GETDATE()
            WHERE CORR_EMPRESA         = @EmpresaEjecucion
              AND CORR_INSTANCIA       = @IdInstancia
              AND LOGIN_SISTEMA_DESTINO = @i_login
              AND PROCESADO            = 0;

            -- 7. Actualizar instancia al paso resultante
            SET @IdEstadoNuevo = @AutoEstadoDestino2;

            IF @AutoTipoMov2 = 3  -- FINALIZA
            BEGIN
                UPDATE dbo.SEG_FLUJO_INSTANCIA
                SET ACTIVO             = 0,
                    FECHA_FIN          = GETDATE(),
                    CORR_ESTADO_ACTUAL = @AutoEstadoDestino2,
                    CORR_PASO_ACTUAL   = NULL,
                    USUARIO_ACTU       = @i_login,
                    ESTACION_ACTU      = 'SP_EjecutarFlujo',
                    FECHA_ACTU         = GETDATE()
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_INSTANCIA = @IdInstancia;
            END
            ELSE
            BEGIN
                UPDATE dbo.SEG_FLUJO_INSTANCIA
                SET CORR_PASO_ACTUAL   = @AutoIdPasoNuevo,
                    CORR_ESTADO_ACTUAL = @AutoEstadoDestino2,
                    USUARIO_ACTU       = @i_login,
                    ESTACION_ACTU      = 'SP_EjecutarFlujo',
                    FECHA_ACTU         = GETDATE()
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_INSTANCIA = @IdInstancia;
            END

            -- 8. Generar notificaciones segun TIPO_NOT de la accion auto-aprobada
            SET @MensajeNotifEnvio = N'Tarea pendiente en el flujo.';
            DELETE FROM @YaNotificados;

            IF @AutoTipoNotif2 = 2 AND @AutoIdPasoNuevo IS NOT NULL  -- SIGUIENTE
            BEGIN
                SET @AutoActorSig     = NULL;
                SET @AutoActorDestSig = NULL;
                SET @AutoUnidadSig    = NULL;

                SELECT @AutoActorSig     = CORR_ACTOR_ORIGEN,
                       @AutoActorDestSig = CORR_ACTOR_DESTINO,
                       @AutoUnidadSig    = CORR_UNIDAD_DESTINO
                FROM dbo.SEG_FLUJO_PASO
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @AutoIdPasoNuevo;

                IF @AutoUnidadSig IS NULL
                BEGIN
                    -- Igual que flujo normal: infiere desde el actor destino del paso auto-aprobado
                    SET @AutoActorParaInf = ISNULL(@AutoActorDestinoPaso, @AutoActorSig);
                    SET @AutoUnidadSig    = dbo.SEG_FN_InferirUnidadActor(@EmpresaEjecucion, @AutoActorParaInf);
                    IF @AutoUnidadSig IS NULL SET @AutoUnidadSig = @i_idUnidadDocumento;
                END

                -- Usar el CORR_ACTOR_DESTINO del paso auto-aprobado como override (igual que flujo normal)
                SET @CorrActorDestinoNuevo = ISNULL(@AutoActorDestinoPaso, @AutoActorSig);

                -- Principal: resuelve con el actor destino del paso auto-aprobado
                -- El ejecutor (@i_login) se excluye: no tiene sentido notificarse a si mismo
                DELETE FROM @Destinatarios; DELETE FROM @DestRaw;
                INSERT INTO @DestRaw (LoginDestino)
                EXEC dbo.SEG_SP_ResolverDestinatariosPaso
                    @CORR_EMPRESA         = @EmpresaEjecucion,
                    @CORR_PASO            = @AutoIdPasoNuevo,
                    @UnidadDocumento      = @i_idUnidadDocumento,
                    @LoginEjecutor        = NULL,
                    @CORR_ACTOR_OVERRIDE  = @AutoActorDestinoPaso,
                    @CORR_UNIDAD_OVERRIDE = @AutoUnidadPaso;
                DELETE FROM @DestRaw WHERE LoginDestino = @i_login;
                INSERT INTO @Destinatarios (RowNum, LoginDestino)
                SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), LoginDestino
                FROM @DestRaw WHERE LoginDestino NOT IN (SELECT LoginDestino FROM @YaNotificados);

                SELECT @RowNum = 1, @MaxRowNum = COUNT(*) FROM @Destinatarios;
                WHILE @RowNum <= @MaxRowNum
                BEGIN
                    SELECT @LoginDestino = LoginDestino FROM @Destinatarios WHERE RowNum = @RowNum;
                    EXEC dbo.GenerarNotificacionesFlujo
                        @i_CORR_EMPRESA          = @EmpresaEjecucion,
                        @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                        @i_CORR_DOCUMENTO        = @i_idDocumento,
                        @i_CORR_INSTANCIA        = @IdInstancia,
                        @i_CORR_PASO             = @AutoIdPasoNuevo,
                        @i_CORR_ACTOR_DESTINO    = @CorrActorDestinoNuevo,
                        @i_CORR_UNIDAD           = @AutoUnidadSig,
                        @i_MENSAJE               = @MensajeNotifEnvio,
                        @i_LOGIN_USUARIO_DESTINO = @LoginDestino,
                        @i_LOGIN_EJECUTOR        = @i_login,
                        @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                        @i_CORR_ESTADO           = @AutoEstadoDestino2,
                        @i_CORR_PASO_EJECUTOR    = @IdPasoNuevo,
                        @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                        @o_ERROR                 = @ErrorNotificacion OUTPUT;
                    IF @ErrorNotificacion IS NOT NULL THROW 50020, @ErrorNotificacion, 1;
                    IF NOT EXISTS (SELECT 1 FROM @YaNotificados WHERE LoginDestino = @LoginDestino)
                        INSERT INTO @YaNotificados (LoginDestino) VALUES (@LoginDestino);
                    SET @RowNum = @RowNum + 1;
                END

                -- Multi-actor del paso que se auto-aprobo
                DELETE FROM @MultiDest;
                INSERT INTO @MultiDest (RowNum, CorrActor, CorrUnidad)
                SELECT ROW_NUMBER() OVER (ORDER BY ORDEN, CORR_PASO_ACTOR_DESTINO),
                       CORR_ACTOR, CORR_UNIDAD
                FROM dbo.SEG_FLUJO_PASO_ACTOR_DESTINO
                WHERE CORR_EMPRESA = @EmpresaEjecucion AND CORR_PASO = @IdPasoNuevo AND ACTIVO = 1;

                SELECT @MA_Iter = 1, @MA_Total = COUNT(*) FROM @MultiDest;
                WHILE @MA_Iter <= @MA_Total
                BEGIN
                    SELECT @MA_CorrActor = CorrActor, @MA_CorrUnidad = CorrUnidad
                    FROM @MultiDest WHERE RowNum = @MA_Iter;
                    SET @MA_UnidadMeta = ISNULL(@MA_CorrUnidad, @i_idUnidadDocumento);

                    DELETE FROM @Destinatarios; DELETE FROM @DestRaw;
                    INSERT INTO @DestRaw (LoginDestino)
                    EXEC dbo.SEG_SP_ResolverDestinatariosPaso
                        @CORR_EMPRESA         = @EmpresaEjecucion,
                        @CORR_PASO            = @AutoIdPasoNuevo,
                        @UnidadDocumento      = @i_idUnidadDocumento,
                        @LoginEjecutor        = NULL,
                        @CORR_ACTOR_OVERRIDE  = @MA_CorrActor,
                        @CORR_UNIDAD_OVERRIDE = @MA_CorrUnidad;
                    -- Excluir al ejecutor auto-aprobador del multi-actor tambien
                    DELETE FROM @DestRaw WHERE LoginDestino = @i_login;
                    INSERT INTO @Destinatarios (RowNum, LoginDestino)
                    SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), LoginDestino
                    FROM @DestRaw WHERE LoginDestino NOT IN (SELECT LoginDestino FROM @YaNotificados);

                    SELECT @RowNum = 1, @MaxRowNum = COUNT(*) FROM @Destinatarios;
                    WHILE @RowNum <= @MaxRowNum
                    BEGIN
                        SELECT @LoginDestino = LoginDestino FROM @Destinatarios WHERE RowNum = @RowNum;
                        EXEC dbo.GenerarNotificacionesFlujo
                            @i_CORR_EMPRESA          = @EmpresaEjecucion,
                            @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                            @i_CORR_DOCUMENTO        = @i_idDocumento,
                            @i_CORR_INSTANCIA        = @IdInstancia,
                            @i_CORR_PASO             = @AutoIdPasoNuevo,
                            @i_CORR_ACTOR_DESTINO    = @MA_CorrActor,
                            @i_CORR_UNIDAD           = @MA_UnidadMeta,
                            @i_MENSAJE               = @MensajeNotifEnvio,
                            @i_LOGIN_USUARIO_DESTINO = @LoginDestino,
                            @i_LOGIN_EJECUTOR        = @i_login,
                            @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                            @i_CORR_ESTADO           = @AutoEstadoDestino2,
                            @i_CORR_PASO_EJECUTOR    = @IdPasoNuevo,
                            @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                            @o_ERROR                 = @ErrorNotificacion OUTPUT;
                        IF @ErrorNotificacion IS NOT NULL THROW 50021, @ErrorNotificacion, 1;
                        IF NOT EXISTS (SELECT 1 FROM @YaNotificados WHERE LoginDestino = @LoginDestino)
                            INSERT INTO @YaNotificados (LoginDestino) VALUES (@LoginDestino);
                        SET @RowNum = @RowNum + 1;
                    END
                    SET @MA_Iter = @MA_Iter + 1;
                END
            END
            ELSE IF @AutoTipoNotif2 = 3  -- CREADOR
            BEGIN
                EXEC dbo.GenerarNotificacionesFlujo
                    @i_CORR_EMPRESA          = @EmpresaEjecucion,
                    @i_CORR_TIPO_DOCUMENTO   = @idTipoDocumento,
                    @i_CORR_DOCUMENTO        = @i_idDocumento,
                    @i_CORR_INSTANCIA        = @IdInstancia,
                    @i_CORR_PASO             = @IdPasoNuevo,
                    @i_CORR_ACTOR_DESTINO    = @AutoActorPaso,
                    @i_CORR_UNIDAD           = @i_idUnidadDocumento,
                    @i_MENSAJE               = @MensajeNotifEnvio,
                    @i_LOGIN_USUARIO_DESTINO = @LoginCreador,
                    @i_LOGIN_EJECUTOR        = @i_login,
                    @i_LOGIN_SISTEMA_ORIGEN  = @i_login,
                    @i_CORR_ESTADO           = @AutoEstadoDestino2,
                    @i_CORR_PASO_EJECUTOR    = @IdPasoNuevo,
                    @o_CORR_NOTIFICACION     = @IdNotificacionGenerada OUTPUT,
                    @o_ERROR                 = @ErrorNotificacion OUTPUT;
                IF @ErrorNotificacion IS NOT NULL THROW 50022, @ErrorNotificacion, 1;
            END
            -- TIPO_NOT=5 (NO NOTIFICA) u otros: no generar notificaciones

            -- 9. Si el resultado fue FINALIZA, cerrar todas las notifs pendientes
            IF @AutoTipoMov2 = 3
            BEGIN
                UPDATE dbo.SEG_FLUJO_NOTIFICACION
                SET PROCESADO    = 1,
                    USUARIO_ACTU = @i_login,
                    FECHA_ACTU   = GETDATE()
                WHERE CORR_EMPRESA   = @EmpresaEjecucion
                  AND CORR_INSTANCIA = @IdInstancia
                  AND PROCESADO      = 0;
            END

            -- 10. Preparar siguiente iteracion
            SET @IdPasoNuevo    = @AutoIdPasoNuevo;
            SET @TipoMovimiento = @AutoTipoMov2;
            SET @AutoAprobCount = @AutoAprobCount + 1;

        END  -- FIN WHILE auto-aprobacion (v9.8)

        COMMIT TRAN;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        SET @o_error = 'Error al ejecutar flujo: ' + ERROR_MESSAGE();
        RETURN -51;
    END CATCH

    SET @o_idEstadoDocumento = @IdEstadoNuevo;
    SET @o_error = NULL;
    RETURN 0;
END
GO

-- ======================================================
-- SP: Limpiar simulacion (v9.2)
-- ======================================================
CREATE OR ALTER PROCEDURE dbo.SEG_SP_LimpiarSimulacion
    @i_idDocumento      INT          = 9999,
    @i_CODIGO_OPCION    VARCHAR(50)  = 'SC_PERMISO_DE_PERSONAL',
    @i_idTipoDocumento  INT          = NULL   -- alternativa directa a @i_CODIGO_OPCION
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CORR_INSTANCIA  INT;
    DECLARE @idTipoDocumento INT;
    DECLARE @Empresa         INT = 1;

    -- Resolver tipo de documento: directo o desde CODIGO_OPCION
    IF @i_idTipoDocumento IS NOT NULL
        SET @idTipoDocumento = @i_idTipoDocumento;
    ELSE
        SELECT @idTipoDocumento = CORR_TIPO_DOCUMENTO
        FROM dbo.SEG_FLUJO_TIPO_DOCUMENTO
        WHERE CORR_EMPRESA  = @Empresa
          AND CODIGO_OPCION = @i_CODIGO_OPCION
          AND ACTIVO        = 1;

    IF @idTipoDocumento IS NULL
    BEGIN
        PRINT 'No se encontro tipo de documento para la opcion: ' + ISNULL(@i_CODIGO_OPCION, 'NULL');
        RETURN 0;
    END

    SELECT @CORR_INSTANCIA = CORR_INSTANCIA
    FROM dbo.SEG_FLUJO_INSTANCIA
    WHERE CORR_EMPRESA        = @Empresa
      AND CORR_TIPO_DOCUMENTO = @idTipoDocumento
      AND CORR_DOCUMENTO      = @i_idDocumento;

    IF @CORR_INSTANCIA IS NULL
    BEGIN
        PRINT 'No se encontro instancia para documento=' + CAST(@i_idDocumento AS VARCHAR)
            + ' opcion=' + @i_CODIGO_OPCION;
        RETURN 0;
    END

    BEGIN TRY
        BEGIN TRAN;

        DELETE FROM dbo.SEG_FLUJO_NOTIFICACION WHERE CORR_EMPRESA = @Empresa AND CORR_INSTANCIA = @CORR_INSTANCIA;
        DELETE FROM dbo.SEG_FLUJO_BITACORA      WHERE CORR_EMPRESA = @Empresa AND CORR_INSTANCIA = @CORR_INSTANCIA;
        DELETE FROM dbo.SEG_FLUJO_INSTANCIA     WHERE CORR_EMPRESA = @Empresa AND CORR_INSTANCIA = @CORR_INSTANCIA;

        COMMIT TRAN;
        PRINT 'Simulacion limpiada para instancia ' + CAST(@CORR_INSTANCIA AS VARCHAR);
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        PRINT 'Error al limpiar simulacion: ' + ERROR_MESSAGE();
    END CATCH
END
GO

PRINT 'Script 3 v9.7 completado: CORR_ESTADO_ORIGEN inferido dinamicamente para pasos no-iniciales. SEG_FLUJO_PASO queda con metadata minima.';