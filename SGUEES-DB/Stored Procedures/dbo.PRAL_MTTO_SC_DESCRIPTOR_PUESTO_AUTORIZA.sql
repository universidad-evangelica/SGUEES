SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO
-- =============================================================================
-- Procedimiento: dbo.PRAL_MTTO_SC_DESCRIPTOR_PUESTO_AUTORIZA
-- Pantalla:      SC_DESCRIPTOR_PUESTO (tipo de documento / proceso 102)
--
-- Qué hace:
--   Ejecuta una operación del flujo del descriptor de puesto:
--   guardar, solicitar, aprobar, observar, inactivar o reactivar.
--
-- Importante:
--   Este procedimiento NO crea ni modifica el contenido del descriptor
--   (título, funciones, perfil, etc.). Eso lo hace la API con Insert/Update.
--   Aquí solo se mueve el flujo y se actualiza el estado en SC_DESCRIPTOR_PUESTO.
--
-- Pasos que sigue:
--   1) Revisa que vengan los datos mínimos y que el descriptor exista.
--   2) Busca la configuración del flujo (tipo, proceso, estados, paso Borrador).
--   3) Detecta en qué situación está el documento:
--        NUEVO     = todavía no tiene registro en el flujo
--        BORRADOR  = está en borrador / editable
--        EN_FLUJO  = está en aprobación (JI, TH o Jefe TH)
--        VIGENCIA  = ya terminó el ciclo (Activo o Inactivo)
--   4) Verifica que la operación pedida aplique a esa situación.
--   5) Busca el CORR_ACCION correcto en la configuración del paso
--      (o usa el que manden en @CORR_ACCION si lo envían).
--   6) Si es la primera vez y piden Solicitar (ENVIAR): primero crea el
--      registro del flujo (GUARDAR) y después avanza (ENVIAR).
--   7) Llama a EjecutarFlujoProceso (motor general del sistema).
--   8) Actualiza CORR_ESTADO y NOMBRE_ESTADO en SC_DESCRIPTOR_PUESTO
--      y los devuelve para que la pantalla actualice la fila sin recargar todo.
--
-- Valores de @OPERACION (los usa la API y el formulario):
--   1 = GUARDAR    Queda en Borrador. Si es la primera vez, crea el flujo.
--   2 = ENVIAR     Solicitar autorización (botón "Solicitar" en pantalla).
--   3 = APROBAR    Avanza al siguiente paso de autorización.
--   4 = OBSERVAR   Devuelve el documento (queda Observado).
--   5 = INACTIVAR  Solo en Vigencia y si está Activo → pasa a Inactivo.
--   6 = REACTIVAR  Solo en Vigencia y si está Inactivo → vuelve a Borrador
--                  (hay que volver a solicitar y autorizar de nuevo).
--
-- Tipos de movimiento en la configuración del flujo:
--   1 = AVANZA (pasa al siguiente paso)
--   2 = RETORNA (regresa)
--   4 = MANTIENE (se queda en el mismo paso, solo actualiza estado)
--
-- @CORR_UNIDAD_DOCUMENTO:
--   Obligatorio solo la primera vez (cuando aún no existe el flujo).
--   Después puede ir NULL; el motor usa la unidad ya guardada.
--
-- Códigos que puede devolver (RETURN):
--    0 = todo bien
--   -1 = faltan datos o el descriptor no existe
--   -2 = no hay tipo de documento configurado
--   -3 = no hay flujo por defecto
--   -4 = no hay paso inicial
--   -5 = @OPERACION no es 1..6
--   -7 = no hay acción configurada para esa operación en ese paso
--   -8 = falta la unidad al crear el flujo por primera vez
--   -9 = falló el GUARDAR previo al ENVIAR
--  -10 = falló EjecutarFlujoProceso (detalle en @MENSAJE_ERROR)
--  -11 a -19 = la operación no aplica a la situación actual del documento
-- =============================================================================
CREATE OR ALTER PROCEDURE [dbo].[PRAL_MTTO_SC_DESCRIPTOR_PUESTO_AUTORIZA]
(
	-- Empresa del documento (por defecto 1).
	@CORR_EMPRESA INT = 1,
	-- Número del descriptor. Debe existir ya en SC_DESCRIPTOR_PUESTO.
	@CORR_DESCRIPTOR_PUESTO INT,
	-- Unidad del organigrama. Solo obligatoria la primera vez que se crea el flujo.
	@CORR_UNIDAD_DOCUMENTO INT = NULL,
	-- Operación pedida: 1 Guardar, 2 Enviar/Solicitar, 3 Aprobar,
	-- 4 Observar, 5 Inactivar, 6 Reactivar. Si no se manda, usar @CORR_ACCION.
	@OPERACION INT = NULL,
	-- Si se conoce el CORR_ACCION exacto de la configuración, se puede mandar aquí
	-- y se omite la búsqueda por @OPERACION.
	@CORR_ACCION INT = NULL,
	-- Usuario que ejecuta la acción (queda en bitácora y notificaciones).
	@LOGIN_SISTEMA VARCHAR(30),
	-- Comentario obligatorio (se guarda en la bitácora del flujo).
	@OBSERVACION NVARCHAR(MAX),
	-- Sale: estado resultante después de ejecutar el flujo.
	@CORR_ESTADO INT OUTPUT,
	-- Sale: mensaje de error si algo falla.
	@MENSAJE_ERROR VARCHAR(500) OUTPUT,
	-- Sale: CORR_ACCION que se usó realmente.
	@CORR_ACCION_USADA INT = NULL OUTPUT,
	-- Sale: paso actual del flujo.
	@CORR_PASO_ACTUAL INT = NULL OUTPUT,
	-- Sale: situación detectada (NUEVO, BORRADOR, EN_FLUJO o VIGENCIA).
	@MODO VARCHAR(20) = NULL OUTPUT,
	-- Sale: nombre del estado (también se guarda en SC_DESCRIPTOR_PUESTO).
	@NOMBRE_ESTADO VARCHAR(100) = NULL OUTPUT
)
AS
BEGIN
	SET NOCOUNT ON

	-- Variables internas de apoyo (no las manda la API).
	DECLARE @CODIGO_OPCION VARCHAR(50) = 'SC_DESCRIPTOR_PUESTO' -- liga con el tipo de documento del flujo
	DECLARE @EMPRESA INT = ISNULL(@CORR_EMPRESA, 1)
	DECLARE @ID_TIPO_DOCUMENTO INT   -- tipo de documento del descriptor
	DECLARE @ID_FLUJO INT            -- flujo activo por defecto
	DECLARE @ID_INSTANCIA INT        -- registro activo del documento en el flujo
	DECLARE @ID_PASO_ACTUAL INT
	DECLARE @ID_ESTADO_ACTUAL INT
	DECLARE @ID_ACCION INT = @CORR_ACCION
	DECLARE @V_OPERACION INT = @OPERACION
	DECLARE @NOM_OP VARCHAR(20)      -- nombre de la operación para mensajes de error
	DECLARE @ESTADO_TMP INT          -- estado temporal al guardar antes de enviar
	DECLARE @ERROR_TMP VARCHAR(500)
	DECLARE @ES_ESTADO_INICIAL BIT = 0
	DECLARE @ES_NUEVO BIT = 0
	DECLARE @ES_BORRADOR BIT = 0
	DECLARE @ES_VIGENCIA BIT = 0
	DECLARE @V_MODO VARCHAR(20)
	DECLARE @ACCION_GUARDAR INT      -- acción de "quedarse" usada solo al crear + enviar
	DECLARE @UNIDAD_DOC INT = @CORR_UNIDAD_DOCUMENTO
	DECLARE @NOMBRE_PASO VARCHAR(200)
	DECLARE @V_NOMBRE_ESTADO VARCHAR(100)
	DECLARE @EST_INACTIVO INT        -- id del estado "Inactivo"
	DECLARE @EST_ACTIVO INT          -- id del estado "Activo"
	DECLARE @EST_BORRADOR INT        -- id del estado "Borrador" (a donde vuelve al reactivar)
	DECLARE @PASO_BORRADOR INT       -- CORR_PASO Borrador (a donde vuelve al reactivar)
	DECLARE @PASO_VIGENCIA INT       -- CORR_PASO Vigencia (Inactivar / Reactivar)

	-- Limpia los valores de salida por si vienen con datos de otra llamada.
	SET @CORR_ESTADO = NULL
	SET @MENSAJE_ERROR = NULL
	SET @CORR_ACCION_USADA = NULL
	SET @CORR_PASO_ACTUAL = NULL
	SET @MODO = NULL
	SET @NOMBRE_ESTADO = NULL

	-- =========================================================================
	-- PASO 1 — Revisar datos de entrada
	-- Qué hace: comprueba número de descriptor, que exista, usuario, comentario
	--           y que indiquen operación o acción.
	-- Cómo lo hace: IF con mensajes claros y RETURN si falta algo.
	-- =========================================================================
	IF @CORR_DESCRIPTOR_PUESTO IS NULL
	BEGIN
		SET @MENSAJE_ERROR = 'Debe indicar @CORR_DESCRIPTOR_PUESTO.'
		RETURN -1
	END

	IF NOT EXISTS (
		SELECT 1 FROM dbo.SC_DESCRIPTOR_PUESTO
		WHERE CORR_EMPRESA = @EMPRESA AND CORR_DESCRIPTOR_PUESTO = @CORR_DESCRIPTOR_PUESTO
	)
	BEGIN
		SET @MENSAJE_ERROR = 'No existe el descriptor CORR_DESCRIPTOR_PUESTO=' + CAST(@CORR_DESCRIPTOR_PUESTO AS VARCHAR) + '.'
		RETURN -1
	END

	IF @LOGIN_SISTEMA IS NULL OR LTRIM(RTRIM(@LOGIN_SISTEMA)) = ''
	BEGIN
		SET @MENSAJE_ERROR = 'Debe indicar @LOGIN_SISTEMA.'
		RETURN -1
	END

	IF @OBSERVACION IS NULL OR LTRIM(RTRIM(@OBSERVACION)) = ''
	BEGIN
		SET @MENSAJE_ERROR = 'El comentario (@OBSERVACION) es obligatorio.'
		RETURN -1
	END

	IF @ID_ACCION IS NULL AND @V_OPERACION IS NULL
	BEGIN
		SET @MENSAJE_ERROR = 'Indique @OPERACION (1=GUARDAR,2=ENVIAR,3=APROBAR,4=OBSERVAR,5=INACTIVAR,6=REACTIVAR) o @CORR_ACCION.'
		RETURN -1
	END

	IF @ID_ACCION IS NULL AND @V_OPERACION NOT IN (1, 2, 3, 4, 5, 6)
	BEGIN
		SET @MENSAJE_ERROR = 'Operacion invalida: ' + CAST(ISNULL(@V_OPERACION, -1) AS VARCHAR)
			+ '. Use 1=GUARDAR, 2=ENVIAR, 3=APROBAR, 4=OBSERVAR, 5=INACTIVAR, 6=REACTIVAR.'
		RETURN -5
	END

	-- Nombre de la operación solo para armar mensajes de error claros.
	SET @NOM_OP = CASE @V_OPERACION
		WHEN 1 THEN 'GUARDAR'
		WHEN 2 THEN 'ENVIAR'
		WHEN 3 THEN 'APROBAR'
		WHEN 4 THEN 'OBSERVAR'
		WHEN 5 THEN 'INACTIVAR'
		WHEN 6 THEN 'REACTIVAR'
		ELSE CAST(ISNULL(@V_OPERACION, 0) AS VARCHAR(10))
	END

	-- =========================================================================
	-- PASO 2 — Buscar la configuración del flujo
	-- Qué hace: obtiene tipo de documento, flujo por defecto, estados Activo /
	--           Inactivo / Borrador y los pasos Borrador (7) / Vigencia (11) por CORR_PASO.
	-- Cómo lo hace: lee las tablas SEG_FLUJO_* con CODIGO_OPCION = SC_DESCRIPTOR_PUESTO.
	-- Para qué: sin esa configuración no se puede mover el documento;
	--           esos estados se usan al inactivar o reactivar.
	-- =========================================================================
	SELECT @ID_TIPO_DOCUMENTO = CORR_TIPO_DOCUMENTO
	FROM dbo.SEG_FLUJO_TIPO_DOCUMENTO
	WHERE CORR_EMPRESA = @EMPRESA AND CODIGO_OPCION = @CODIGO_OPCION AND ACTIVO = 1

	IF @ID_TIPO_DOCUMENTO IS NULL
	BEGIN
		SET @MENSAJE_ERROR = 'No existe tipo de documento activo para SC_DESCRIPTOR_PUESTO.'
		RETURN -2
	END

	SELECT TOP 1 @ID_FLUJO = CORR_FLUJO_PROCESO
	FROM dbo.SEG_FLUJO_PROCESO
	WHERE CORR_EMPRESA = @EMPRESA AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
	  AND ACTIVO = 1 AND ES_DEFECTO = 1

	IF @ID_FLUJO IS NULL
	BEGIN
		SET @MENSAJE_ERROR = 'No hay flujo defecto activo para descriptor de puesto.'
		RETURN -3
	END

	-- Ids fijos SEG_FLUJO_ESTADO (SC_DESCRIPTOR_PUESTO): 11=Borrador, 14=Activo, 18=Inactivo.
	-- Qué hace: resuelve estados por CORR_ESTADO (no por nombre) para Inactivar/Reactivar.
	-- Cómo: lee el id en el catálogo del tipo de documento; renombrar NOMBRE_ESTADO no rompe.
	SELECT @EST_ACTIVO = CORR_ESTADO FROM dbo.SEG_FLUJO_ESTADO
	WHERE CORR_EMPRESA = @EMPRESA AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
	  AND CORR_ESTADO = 14 AND ACTIVO = 1

	SELECT @EST_INACTIVO = CORR_ESTADO FROM dbo.SEG_FLUJO_ESTADO
	WHERE CORR_EMPRESA = @EMPRESA AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
	  AND CORR_ESTADO = 18 AND ACTIVO = 1

	SELECT @EST_BORRADOR = CORR_ESTADO FROM dbo.SEG_FLUJO_ESTADO
	WHERE CORR_EMPRESA = @EMPRESA AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
	  AND CORR_ESTADO = 11 AND ACTIVO = 1

	-- Pasos fijos SEG_FLUJO_PASO (flujo descriptor): 7=Borrador, 11=Vigencia.
	-- Qué hace: resuelve pasos por CORR_PASO (no por nombre) para Reactivar / modo Vigencia.
	-- Cómo: lee el id en el flujo defecto; renombrar NOMBRE_PASO no rompe.
	SELECT @PASO_BORRADOR = CORR_PASO
	FROM dbo.SEG_FLUJO_PASO
	WHERE CORR_EMPRESA = @EMPRESA AND CORR_FLUJO_PROCESO = @ID_FLUJO
	  AND CORR_PASO = 7

	SELECT @PASO_VIGENCIA = CORR_PASO
	FROM dbo.SEG_FLUJO_PASO
	WHERE CORR_EMPRESA = @EMPRESA AND CORR_FLUJO_PROCESO = @ID_FLUJO
	  AND CORR_PASO = 11

	-- =========================================================================
	-- PASO 3 — Detectar en qué situación está el documento
	-- Qué hace: define si es NUEVO, BORRADOR, EN_FLUJO o VIGENCIA.
	-- Cómo lo hace:
	--   - Si no hay registro activo en el flujo → NUEVO (usa paso Borrador / CORR 7).
	--   - Si CORR_PASO_ACTUAL = Vigencia (CORR 11) → VIGENCIA.
	--   - Si el estado es inicial o está en el primer paso editable → BORRADOR.
	--   - En cualquier otro caso → EN_FLUJO (aprobaciones en curso).
	-- Para qué: saber qué operaciones se permiten (guardar/solicitar, aprobar,
	--           observar, inactivar o reactivar).
	-- =========================================================================
	SELECT @ID_INSTANCIA = CORR_INSTANCIA,
	       @ID_PASO_ACTUAL = CORR_PASO_ACTUAL,
	       @ID_ESTADO_ACTUAL = CORR_ESTADO_ACTUAL
	FROM dbo.SEG_FLUJO_INSTANCIA
	WHERE CORR_EMPRESA = @EMPRESA
	  AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
	  AND CORR_DOCUMENTO = @CORR_DESCRIPTOR_PUESTO
	  AND ACTIVO = 1

	IF @ID_INSTANCIA IS NULL
	BEGIN
		SET @ES_NUEVO = 1
		SET @V_MODO = 'NUEVO'
		-- Todavía no hay flujo: el paso de referencia es Borrador (CORR_PASO 7).
		SET @ID_PASO_ACTUAL = @PASO_BORRADOR
		IF @ID_PASO_ACTUAL IS NULL
			SELECT TOP 1 @ID_PASO_ACTUAL = CORR_PASO
			FROM dbo.SEG_FLUJO_PASO
			WHERE CORR_EMPRESA = @EMPRESA AND CORR_FLUJO_PROCESO = @ID_FLUJO
			ORDER BY ORDEN
	END
	ELSE
	BEGIN
		SELECT @ES_ESTADO_INICIAL = ISNULL(E.ES_INICIAL, 0),
		       @NOMBRE_PASO = P.NOMBRE_PASO
		FROM dbo.SEG_FLUJO_ESTADO E
		INNER JOIN dbo.SEG_FLUJO_PASO P
			ON P.CORR_EMPRESA = @EMPRESA AND P.CORR_PASO = @ID_PASO_ACTUAL
		WHERE E.CORR_EMPRESA = @EMPRESA AND E.CORR_ESTADO = @ID_ESTADO_ACTUAL

		IF @PASO_VIGENCIA IS NOT NULL AND @ID_PASO_ACTUAL = @PASO_VIGENCIA
		BEGIN
			SET @ES_VIGENCIA = 1
			SET @V_MODO = 'VIGENCIA'
		END
		ELSE IF @ES_ESTADO_INICIAL = 1
			OR EXISTS (
				-- Si el primer paso tiene acción de "quedarse" (MANTIENE),
				-- se considera que sigue en borrador editable.
				SELECT 1
				FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO A
				INNER JOIN dbo.SEG_FLUJO_PASO P
					ON P.CORR_EMPRESA = A.CORR_EMPRESA AND P.CORR_PASO = A.CORR_PASO
				WHERE A.CORR_EMPRESA = @EMPRESA AND A.CORR_FLUJO_PROCESO = @ID_FLUJO
				  AND A.CORR_PASO = @ID_PASO_ACTUAL AND A.CORR_TIPO_MOVIMIENTO = 4
				  AND A.PERMITIDO = 1 AND A.ACTIVO = 1 AND P.ORDEN = 1
			)
		BEGIN
			SET @ES_BORRADOR = 1
			SET @V_MODO = 'BORRADOR'
		END
		ELSE
			SET @V_MODO = 'EN_FLUJO'
	END

	SET @MODO = @V_MODO
	SET @CORR_PASO_ACTUAL = @ID_PASO_ACTUAL

	IF @ID_PASO_ACTUAL IS NULL
	BEGIN
		SET @MENSAJE_ERROR = 'El flujo descriptor no tiene paso inicial configurado.'
		RETURN -4
	END

	-- =========================================================================
	-- PASO 4 — Validar que la operación aplique a la situación actual
	-- Qué hace: rechaza pedidos inválidos antes de llamar al motor.
	-- Cómo lo hace: solo si no mandaron @CORR_ACCION directo.
	-- Ejemplo: en Borrador no se puede Aprobar; hay que Solicitar (ENVIAR).
	-- =========================================================================
	IF @V_OPERACION IS NOT NULL AND @ID_ACCION IS NULL
	BEGIN
		IF @V_OPERACION = 1 -- GUARDAR
		BEGIN
			IF @V_MODO NOT IN ('NUEVO', 'BORRADOR')
			BEGIN
				SET @MENSAJE_ERROR = 'GUARDAR(1) solo aplica en Borrador/NUEVO (modo actual: ' + @V_MODO + ').'
				RETURN -11
			END
			IF @ES_NUEVO = 1 AND @UNIDAD_DOC IS NULL
			BEGIN
				SET @MENSAJE_ERROR = 'Al crear (GUARDAR=1) debe enviar @CORR_UNIDAD_DOCUMENTO (el motor la guarda en la instancia).'
				RETURN -8
			END
		END
		ELSE IF @V_OPERACION = 2 -- ENVIAR (botón Solicitar en pantalla)
		BEGIN
			IF @V_MODO NOT IN ('NUEVO', 'BORRADOR')
			BEGIN
				SET @MENSAJE_ERROR = 'ENVIAR(2) solo aplica en Borrador/NUEVO. Modo actual: ' + @V_MODO + '.'
				RETURN -12
			END
			IF @ES_NUEVO = 1 AND @UNIDAD_DOC IS NULL
			BEGIN
				SET @MENSAJE_ERROR = 'Al crear y ENVIAR(2) debe enviar @CORR_UNIDAD_DOCUMENTO (el motor la guarda en la instancia).'
				RETURN -8
			END
		END
		ELSE IF @V_OPERACION IN (3, 4) -- APROBAR / OBSERVAR
		BEGIN
			IF @ES_NUEVO = 1
			BEGIN
				SET @MENSAJE_ERROR = 'No hay instancia. Primero GUARDAR(1) o ENVIAR(2).'
				RETURN -13
			END
			IF @ES_BORRADOR = 1 AND @V_OPERACION = 3
			BEGIN
				SET @MENSAJE_ERROR = 'En Borrador use ENVIAR(2), no APROBAR(3).'
				RETURN -14
			END
			IF @ES_VIGENCIA = 1
			BEGIN
				SET @MENSAJE_ERROR = 'En Vigencia use INACTIVAR(5) o REACTIVAR(6), no APROBAR/OBSERVAR.'
				RETURN -16
			END
		END
		ELSE IF @V_OPERACION IN (5, 6) -- INACTIVAR / REACTIVAR
		BEGIN
			IF @ES_VIGENCIA = 0
			BEGIN
				SET @MENSAJE_ERROR = 'INACTIVAR(5)/REACTIVAR(6) solo aplica en paso Vigencia (modo: ' + @V_MODO + ').'
				RETURN -17
			END
			-- Reactivar solo si está Inactivo; vuelve a Borrador para autorizar de nuevo.
			IF @V_OPERACION = 6 AND @ID_ESTADO_ACTUAL <> @EST_INACTIVO
			BEGIN
				SET @MENSAJE_ERROR = 'REACTIVAR(6) solo aplica cuando el descriptor esta Inactivo.'
				RETURN -18
			END
			-- Inactivar solo si está Activo.
			IF @V_OPERACION = 5 AND @ID_ESTADO_ACTUAL <> @EST_ACTIVO
			BEGIN
				SET @MENSAJE_ERROR = 'INACTIVAR(5) solo aplica cuando el descriptor esta Activo.'
				RETURN -19
			END
		END
	END

	-- =========================================================================
	-- PASO 5 — Buscar el CORR_ACCION según la operación
	-- Qué hace: convierte el número 1..6 en el id de acción del catálogo del paso.
	-- Cómo lo hace: busca en SEG_FLUJO_PASO_ACCION_ESTADO:
	--   1 GUARDAR    = quedarse (movimiento 4)
	--   2 ENVIAR     = avanzar (movimiento 1)
	--   3 APROBAR    = avanzar (movimiento 1)
	--   4 OBSERVAR   = regresar (movimiento 2)
	--   5 INACTIVAR  = quedarse hacia estado Inactivo
	--   6 REACTIVAR  = regresar hacia Borrador
	-- Para qué: EjecutarFlujoProceso solo entiende CORR_ACCION, no el 1..6 de la API.
	-- =========================================================================
	IF @ID_ACCION IS NULL
	BEGIN
		IF @V_OPERACION = 1 -- GUARDAR = quedarse en el paso
			SELECT TOP 1 @ID_ACCION = CORR_ACCION
			FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
			WHERE CORR_EMPRESA = @EMPRESA AND CORR_FLUJO_PROCESO = @ID_FLUJO
			  AND CORR_PASO = @ID_PASO_ACTUAL AND CORR_TIPO_MOVIMIENTO = 4
			  AND PERMITIDO = 1 AND ACTIVO = 1
			ORDER BY CORR_ACCION ASC
		ELSE IF @V_OPERACION = 2 -- ENVIAR / Solicitar = avanzar
			SELECT TOP 1 @ID_ACCION = CORR_ACCION
			FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
			WHERE CORR_EMPRESA = @EMPRESA AND CORR_FLUJO_PROCESO = @ID_FLUJO
			  AND CORR_PASO = @ID_PASO_ACTUAL AND CORR_TIPO_MOVIMIENTO = 1
			  AND PERMITIDO = 1 AND ACTIVO = 1
			ORDER BY CORR_ACCION DESC
		ELSE IF @V_OPERACION = 3 -- APROBAR = avanzar
			SELECT TOP 1 @ID_ACCION = CORR_ACCION
			FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
			WHERE CORR_EMPRESA = @EMPRESA AND CORR_FLUJO_PROCESO = @ID_FLUJO
			  AND CORR_PASO = @ID_PASO_ACTUAL AND CORR_TIPO_MOVIMIENTO = 1
			  AND PERMITIDO = 1 AND ACTIVO = 1
			ORDER BY CORR_ACCION ASC
		ELSE IF @V_OPERACION = 4 -- OBSERVAR = regresar
			SELECT TOP 1 @ID_ACCION = CORR_ACCION
			FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
			WHERE CORR_EMPRESA = @EMPRESA AND CORR_FLUJO_PROCESO = @ID_FLUJO
			  AND CORR_PASO = @ID_PASO_ACTUAL AND CORR_TIPO_MOVIMIENTO = 2
			  AND PERMITIDO = 1 AND ACTIVO = 1
			ORDER BY CORR_ACCION ASC
		ELSE IF @V_OPERACION = 5 -- INACTIVAR
			SELECT TOP 1 @ID_ACCION = CORR_ACCION
			FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
			WHERE CORR_EMPRESA = @EMPRESA AND CORR_FLUJO_PROCESO = @ID_FLUJO
			  AND CORR_PASO = @ID_PASO_ACTUAL AND CORR_TIPO_MOVIMIENTO = 4
			  AND CORR_ESTADO_DESTINO = @EST_INACTIVO
			  AND PERMITIDO = 1 AND ACTIVO = 1
			ORDER BY CORR_ACCION ASC
		ELSE IF @V_OPERACION = 6 -- REACTIVAR = regresar a Borrador
			SELECT TOP 1 @ID_ACCION = CORR_ACCION
			FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
			WHERE CORR_EMPRESA = @EMPRESA AND CORR_FLUJO_PROCESO = @ID_FLUJO
			  AND CORR_PASO = @ID_PASO_ACTUAL AND CORR_TIPO_MOVIMIENTO = 2
			  AND CORR_ESTADO_DESTINO = @EST_BORRADOR
			  AND (@PASO_BORRADOR IS NULL OR CORR_PASO_DESTINO = @PASO_BORRADOR)
			  AND PERMITIDO = 1 AND ACTIVO = 1
			ORDER BY CORR_ACCION ASC

		IF @ID_ACCION IS NULL
		BEGIN
			SET @MENSAJE_ERROR = 'No hay accion para operacion ' + @NOM_OP + '(' + CAST(@V_OPERACION AS VARCHAR) + ')'
				+ ' en paso ' + CAST(@ID_PASO_ACTUAL AS VARCHAR)
				+ ' (modo ' + @V_MODO + ').'
			RETURN -7
		END
	END

	SET @CORR_ACCION_USADA = @ID_ACCION

	-- =========================================================================
	-- PASO 6 — Primera vez + Solicitar (ENVIAR): crear el flujo antes de avanzar
	-- Qué hace: si el documento aún no tiene registro en el flujo y piden
	--           Enviar/Solicitar, primero lo crea (GUARDAR) y luego el paso 7 lo avanza.
	-- Cómo lo hace: llama a EjecutarFlujoProceso con la acción de "quedarse"
	--           y actualiza el estado en SC_DESCRIPTOR_PUESTO.
	-- Para qué: el motor no puede avanzar un documento que todavía no está en el flujo.
	-- =========================================================================
	IF @ES_NUEVO = 1 AND @V_OPERACION = 2
	BEGIN
		SELECT TOP 1 @ACCION_GUARDAR = CORR_ACCION
		FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
		WHERE CORR_EMPRESA = @EMPRESA AND CORR_FLUJO_PROCESO = @ID_FLUJO
		  AND CORR_PASO = @ID_PASO_ACTUAL AND CORR_TIPO_MOVIMIENTO = 4
		  AND PERMITIDO = 1 AND ACTIVO = 1
		ORDER BY CORR_ACCION ASC

		IF @ACCION_GUARDAR IS NULL SET @ACCION_GUARDAR = 1

		EXEC dbo.EjecutarFlujoProceso
			@i_CORR_EMPRESA = @EMPRESA,
			@i_CODIGO_OPCION = @CODIGO_OPCION,
			@i_idDocumento = @CORR_DESCRIPTOR_PUESTO,
			@i_idUnidadDocumento = @UNIDAD_DOC,
			@i_idAccion = @ACCION_GUARDAR,
			@i_login = @LOGIN_SISTEMA,
			@i_Observacion = @OBSERVACION,
			@o_idEstadoDocumento = @ESTADO_TMP OUTPUT,
			@o_Error = @ERROR_TMP OUTPUT

		IF @ERROR_TMP IS NOT NULL
		BEGIN
			SET @CORR_ESTADO = @ESTADO_TMP
			SET @MENSAJE_ERROR = 'Error al crear (GUARDAR) previo a ENVIAR: ' + @ERROR_TMP
			RETURN -9
		END

		IF @ESTADO_TMP IS NOT NULL
		BEGIN
			SELECT @V_NOMBRE_ESTADO = LEFT(NOMBRE_ESTADO, 50)
			FROM dbo.SEG_FLUJO_ESTADO
			WHERE CORR_EMPRESA = @EMPRESA AND CORR_ESTADO = @ESTADO_TMP

			UPDATE dbo.SC_DESCRIPTOR_PUESTO
			SET CORR_ESTADO = @ESTADO_TMP,
				NOMBRE_ESTADO = @V_NOMBRE_ESTADO,
				USUARIO_ACTU = @LOGIN_SISTEMA,
				ESTACION_ACTU = HOST_NAME(),
				FECHA_ACTU = GETDATE()
			WHERE CORR_EMPRESA = @EMPRESA AND CORR_DESCRIPTOR_PUESTO = @CORR_DESCRIPTOR_PUESTO
		END
	END

	-- =========================================================================
	-- PASO 7 — Ejecutar la operación en el motor del flujo
	-- Qué hace: aplica la acción (avanzar, regresar o quedarse).
	-- Cómo lo hace: llama a EjecutarFlujoProceso, que actualiza el registro del
	--           flujo, la bitácora y las notificaciones.
	-- Para qué: este procedimiento solo elige la acción correcta; el motor
	--           hace el movimiento real del documento.
	-- =========================================================================
	EXEC dbo.EjecutarFlujoProceso
		@i_CORR_EMPRESA = @EMPRESA,
		@i_CODIGO_OPCION = @CODIGO_OPCION,
		@i_idDocumento = @CORR_DESCRIPTOR_PUESTO,
		@i_idUnidadDocumento = @UNIDAD_DOC,
		@i_idAccion = @ID_ACCION,
		@i_login = @LOGIN_SISTEMA,
		@i_Observacion = @OBSERVACION,
		@o_idEstadoDocumento = @CORR_ESTADO OUTPUT,
		@o_Error = @MENSAJE_ERROR OUTPUT

	IF @MENSAJE_ERROR IS NOT NULL
		RETURN -10

	-- =========================================================================
	-- PASO 8 — Actualizar el estado en la tabla del descriptor
	-- Qué hace: deja SC_DESCRIPTOR_PUESTO con el mismo estado que el flujo.
	-- Cómo lo hace: actualiza CORR_ESTADO, NOMBRE_ESTADO y datos de auditoría;
	--           luego vuelve a leer el paso actual.
	-- Para qué: la pantalla puede actualizar la fila con estos datos
	--           sin volver a consultar todo el listado (GetAll).
	-- =========================================================================
	IF @CORR_ESTADO IS NOT NULL
	BEGIN
		SELECT @V_NOMBRE_ESTADO = LEFT(NOMBRE_ESTADO, 50)
		FROM dbo.SEG_FLUJO_ESTADO
		WHERE CORR_EMPRESA = @EMPRESA AND CORR_ESTADO = @CORR_ESTADO

		UPDATE dbo.SC_DESCRIPTOR_PUESTO
		SET CORR_ESTADO = @CORR_ESTADO,
			NOMBRE_ESTADO = @V_NOMBRE_ESTADO,
			USUARIO_ACTU = @LOGIN_SISTEMA,
			ESTACION_ACTU = HOST_NAME(),
			FECHA_ACTU = GETDATE()
		WHERE CORR_EMPRESA = @EMPRESA AND CORR_DESCRIPTOR_PUESTO = @CORR_DESCRIPTOR_PUESTO

		SET @NOMBRE_ESTADO = @V_NOMBRE_ESTADO
	END

	SELECT @CORR_PASO_ACTUAL = CORR_PASO_ACTUAL
	FROM dbo.SEG_FLUJO_INSTANCIA
	WHERE CORR_EMPRESA = @EMPRESA
	  AND CORR_TIPO_DOCUMENTO = @ID_TIPO_DOCUMENTO
	  AND CORR_DOCUMENTO = @CORR_DESCRIPTOR_PUESTO
	  AND ACTIVO = 1

	RETURN 0
END
GO
