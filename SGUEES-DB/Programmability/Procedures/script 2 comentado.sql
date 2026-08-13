GO
-- =============================================================================
-- SCRIPT 2 COMENTADO — PRAL_DATA_SC_UNIDADES_USUARIO
-- Propósito general:
--   Con la empresa y el login del usuario, devolver las unidades a las que
--   tiene acceso, sin repetir ninguna unidad.
-- Fuentes de unidades (se unen):
--   A) Por puesto real del empleado: GEN_EMPLEADO_PUESTO.CORR_UNIDAD (activo)
--   B) Por jefatura activa: SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES
--   C) Por configuración manual: SC_UNIDADES_USUARIO
-- Ejemplo:
--   Coordinador de Desarrollo que además es jefe de Subgerencia ve Subgerencia
--   aunque su puesto no esté en esa unidad.
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
	-- PASO 3: UnidadesComoJefe
	-- Qué hace: unidades donde la persona es jefe activo, aunque su puesto
	--           no pertenezca a esa unidad.
	-- Cómo: cruza el empleado con SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES
	--       filtrando ACTIVO = 1.
	----------------------------------------------------------------------------
	UnidadesComoJefe AS
	(
		SELECT DISTINCT
			JU.CORR_EMPRESA,
			JU.CORR_UNIDAD
		FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES JU
		INNER JOIN EmpleadoLogin EL
			ON EL.CORR_EMPRESA = JU.CORR_EMPRESA
		   AND EL.CORR_EMPLEADO = JU.CORR_EMPLEADO
		WHERE JU.CORR_EMPRESA = @CORR_EMPRESA
		  AND JU.ACTIVO = CONVERT(BIT, 1)
	),

	----------------------------------------------------------------------------
	-- PASO 4: UnidadesConfiguradas
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
	-- PASO 5: UnidadesUnion
	-- Qué hace: junta puesto + jefatura + configuración.
	-- Cómo: UNION (no UNION ALL) elimina duplicados.
	--       Si la misma unidad viene de varias fuentes, sale una sola vez.
	----------------------------------------------------------------------------
	UnidadesUnion AS
	(
		SELECT CORR_EMPRESA, CORR_UNIDAD FROM UnidadesPorPuesto
		UNION
		SELECT CORR_EMPRESA, CORR_UNIDAD FROM UnidadesComoJefe
		UNION
		SELECT CORR_EMPRESA, CORR_UNIDAD FROM UnidadesConfiguradas
	)

	----------------------------------------------------------------------------
	-- PASO 6: Resultado final
	-- Qué hace: muestra las unidades con código/nombre y banderas de origen.
	-- Cómo: LEFT JOIN al organigrama y a cada CTE de origen.
	----------------------------------------------------------------------------
	SELECT
		U.CORR_EMPRESA,                                                          -- Empresa
		U.CORR_UNIDAD,                                                           -- Correlativo de unidad
		O.CODIGO_UNIDAD,                                                         -- Código del organigrama
		O.NOMBRE_UNIDAD,                                                         -- Nombre de la unidad
		@LOGIN AS LOGIN_SISTEMA,                                                 -- Login consultado
		CONVERT(BIT, CASE WHEN PP.CORR_UNIDAD IS NOT NULL THEN 1 ELSE 0 END)
			AS ES_POR_PUESTO,                                                    -- 1 = viene de GEN_EMPLEADO_PUESTO
		CONVERT(BIT, CASE WHEN JF.CORR_UNIDAD IS NOT NULL THEN 1 ELSE 0 END)
			AS ES_JEFE_UNIDAD,                                                   -- 1 = es jefe activo de esa unidad
		CONVERT(BIT, CASE WHEN CF.CORR_UNIDAD IS NOT NULL THEN 1 ELSE 0 END)
			AS ES_CONFIGURADA                                                    -- 1 = viene de SC_UNIDADES_USUARIO
	FROM UnidadesUnion U
	LEFT JOIN dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES O
		ON O.CORR_EMPRESA = U.CORR_EMPRESA
	   AND O.CORR_UNIDAD = U.CORR_UNIDAD
	LEFT JOIN UnidadesPorPuesto PP
		ON PP.CORR_EMPRESA = U.CORR_EMPRESA
	   AND PP.CORR_UNIDAD = U.CORR_UNIDAD
	LEFT JOIN UnidadesComoJefe JF
		ON JF.CORR_EMPRESA = U.CORR_EMPRESA
	   AND JF.CORR_UNIDAD = U.CORR_UNIDAD
	LEFT JOIN UnidadesConfiguradas CF
		ON CF.CORR_EMPRESA = U.CORR_EMPRESA
	   AND CF.CORR_UNIDAD = U.CORR_UNIDAD
	ORDER BY U.CORR_EMPRESA, O.CODIGO_UNIDAD, U.CORR_UNIDAD;
END
GO

/*
================================================================================
CÓMO PROBAR (después de recrear el SP en tu sesión)
================================================================================

-- Cesar Lopez: puesto unidad 5 + jefe activo en 5 y 6 + config 1..8
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'cesar.lopez';

-- Daniel Palacios
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'dpalacios';
*/
