GO
-- =============================================================================
-- SCRIPT 2 COMENTADO — PRAL_DATA_SC_UNIDADES_USUARIO
-- Propósito general:
--   Con la empresa y el login del usuario, devolver las unidades a las que
--   tiene acceso, sin repetir ninguna unidad.
-- Fuentes de unidades (se unen):
--   A) Por puesto real del empleado: GEN_EMPLEADO_PUESTO.CORR_UNIDAD (activo)
--   B) Por configuración manual: SC_UNIDADES_USUARIO
-- Importante:
--   NO se usa GEN_UNIDADES_PUESTO aquí (ese catálogo dice en qué unidades
--   puede existir un puesto; no dónde trabaja la persona).
--   La unidad real del empleado está en GEN_EMPLEADO_PUESTO.CORR_UNIDAD.
-- =============================================================================
CREATE PROCEDURE [dbo].[PRAL_DATA_SC_UNIDADES_USUARIO]
@CORR_EMPRESA INT,                 -- Empresa en la que el usuario está logueado
@LOGIN_SISTEMA VARCHAR(30)         -- Login del usuario en el sistema
AS
BEGIN
	-- Evita mensajes de "filas afectadas" en cada SELECT interno
	SET NOCOUNT ON;

	-- Limpia espacios del login para comparar de forma segura
	DECLARE @LOGIN VARCHAR(30) = LTRIM(RTRIM(@LOGIN_SISTEMA));

	----------------------------------------------------------------------------
	-- PASO 1: EmpleadoLogin
	-- Qué hace: busca al empleado de esa empresa asociado al login.
	-- Cómo: mira LOGIN_SISTEMA y LOGIN_SISTEMA_WEB (en la BD el login suele
	--       estar en LOGIN_SISTEMA_WEB).
	----------------------------------------------------------------------------
	;WITH EmpleadoLogin AS
	(
		SELECT
			E.CORR_EMPRESA,
			E.CORR_EMPLEADO
		FROM dbo.GEN_EMPLEADO E
		WHERE E.CORR_EMPRESA = @CORR_EMPRESA
		  AND (
				LTRIM(RTRIM(ISNULL(E.LOGIN_SISTEMA, ''))) = @LOGIN
			 OR LTRIM(RTRIM(ISNULL(E.LOGIN_SISTEMA_WEB, ''))) = @LOGIN
			  )
	),

	----------------------------------------------------------------------------
	-- PASO 2: UnidadesPorPuesto
	-- Qué hace: obtiene las unidades donde el empleado tiene puesto activo.
	-- Cómo: lee CORR_UNIDAD directo de GEN_EMPLEADO_PUESTO (ESTADO = 1).
	--       Ejemplo: Analista en Subgerencia → solo sale Subgerencia, aunque
	--       el puesto exista también en otras unidades del catálogo.
	----------------------------------------------------------------------------
	UnidadesPorPuesto AS
	(
		SELECT DISTINCT
			EP.CORR_EMPRESA,
			EP.CORR_UNIDAD
		FROM dbo.GEN_EMPLEADO_PUESTO EP
		INNER JOIN EmpleadoLogin EL
			ON EL.CORR_EMPRESA = EP.CORR_EMPRESA
		   AND EL.CORR_EMPLEADO = EP.CORR_EMPLEADO
		WHERE EP.CORR_EMPRESA = @CORR_EMPRESA
		  AND EP.ESTADO_EMPLEADO_PUESTO = CONVERT(BIT, 1)
	),

	----------------------------------------------------------------------------
	-- PASO 3: UnidadesConfiguradas
	-- Qué hace: trae las unidades asignadas manualmente al usuario.
	-- Cómo: lee SC_UNIDADES_USUARIO filtrando por empresa + login.
	----------------------------------------------------------------------------
	UnidadesConfiguradas AS
	(
		SELECT DISTINCT
			SU.CORR_EMPRESA,
			SU.CORR_UNIDAD
		FROM dbo.SC_UNIDADES_USUARIO SU
		WHERE SU.CORR_EMPRESA = @CORR_EMPRESA
		  AND LTRIM(RTRIM(SU.LOGIN_SISTEMA)) = @LOGIN
	),

	----------------------------------------------------------------------------
	-- PASO 4: UnidadesUnion
	-- Qué hace: junta unidades por puesto + unidades configuradas.
	-- Cómo: UNION (no UNION ALL) elimina duplicados.
	--       Si la misma unidad viene de ambas fuentes, sale una sola vez.
	----------------------------------------------------------------------------
	UnidadesUnion AS
	(
		SELECT CORR_EMPRESA, CORR_UNIDAD FROM UnidadesPorPuesto
		UNION
		SELECT CORR_EMPRESA, CORR_UNIDAD FROM UnidadesConfiguradas
	)

	----------------------------------------------------------------------------
	-- PASO 5: Resultado final
	-- Qué hace: muestra las unidades con código/nombre del organigrama y
	--           banderas de origen (por puesto / configurada / ambas).
	-- Cómo: LEFT JOIN a SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES para nombres;
	--       LEFT JOIN a las CTE de origen para armar ES_POR_PUESTO y
	--       ES_CONFIGURADA.
	----------------------------------------------------------------------------
	SELECT
		U.CORR_EMPRESA,                                                          -- Empresa
		U.CORR_UNIDAD,                                                           -- Correlativo de unidad
		O.CODIGO_UNIDAD,                                                         -- Código del organigrama
		O.NOMBRE_UNIDAD,                                                         -- Nombre de la unidad
		@LOGIN AS LOGIN_SISTEMA,                                                 -- Login consultado
		CONVERT(BIT, CASE WHEN PP.CORR_UNIDAD IS NOT NULL THEN 1 ELSE 0 END)
			AS ES_POR_PUESTO,                                                    -- 1 = viene de GEN_EMPLEADO_PUESTO
		CONVERT(BIT, CASE WHEN CF.CORR_UNIDAD IS NOT NULL THEN 1 ELSE 0 END)
			AS ES_CONFIGURADA                                                    -- 1 = viene de SC_UNIDADES_USUARIO
	FROM UnidadesUnion U
	LEFT JOIN dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES O
		ON O.CORR_EMPRESA = U.CORR_EMPRESA
	   AND O.CORR_UNIDAD = U.CORR_UNIDAD
	LEFT JOIN UnidadesPorPuesto PP
		ON PP.CORR_EMPRESA = U.CORR_EMPRESA
	   AND PP.CORR_UNIDAD = U.CORR_UNIDAD
	LEFT JOIN UnidadesConfiguradas CF
		ON CF.CORR_EMPRESA = U.CORR_EMPRESA
	   AND CF.CORR_UNIDAD = U.CORR_UNIDAD
	ORDER BY U.CORR_EMPRESA, O.CODIGO_UNIDAD, U.CORR_UNIDAD;
END
GO

/*
================================================================================
CÓMO PROBAR (después de crear/recrear el SP en tu sesión)
================================================================================

-- Cesar Lopez: puesto 7 SOLO en unidad 5 + config SC 1..8
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'cesar.lopez';

-- Daniel Palacios: solo unidad 5 por puesto (sin config SC)
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'dpalacios';

-- Solo configuración
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'alexanderr';
*/
