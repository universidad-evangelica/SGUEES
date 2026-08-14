SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Qué hace: Devuelve las unidades del usuario por empresa (sin duplicados) a
--   partir de:
--   1) Unidades de sus puestos en GEN_EMPLEADO_PUESTO (CORR_UNIDAD).
--   2) Unidades donde es jefe activo (SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES).
--   3) Unidades configuradas en SC_UNIDADES_USUARIO.
-- Cómo lo hace: Filtra por @CORR_EMPRESA y @LOGIN_SISTEMA, resuelve el empleado
--   por LOGIN_SISTEMA / LOGIN_SISTEMA_WEB, une las tres fuentes con UNION y
--   enriquece con el organigrama.
-- Nota: No ejecutar CREATE en el servidor desde el agente; el DBA lo aplica.
-- =============================================================================
CREATE PROCEDURE [dbo].[PRAL_DATA_SC_UNIDADES_USUARIO]
(
	@CORR_EMPRESA INT,
	@LOGIN_SISTEMA VARCHAR(30)
)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @LOGIN VARCHAR(30) = LTRIM(RTRIM(@LOGIN_SISTEMA));

	;WITH EmpleadoLogin AS
	(
		-- Qué hace: localiza al empleado asociado al login en la empresa.
		-- Cómo: compara LOGIN_SISTEMA y LOGIN_SISTEMA_WEB filtrando por @CORR_EMPRESA.
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
	UnidadesPorPuesto AS
	(
		-- Qué hace: unidades donde el empleado tiene puesto.
		-- Cómo: lee CORR_UNIDAD de GEN_EMPLEADO_PUESTO (ya no hay ESTADO_EMPLEADO_PUESTO).
		SELECT DISTINCT
			EP.CORR_EMPRESA,
			EP.CORR_UNIDAD
		FROM dbo.GEN_EMPLEADO_PUESTO EP
		INNER JOIN EmpleadoLogin EL
			ON EL.CORR_EMPRESA = EP.CORR_EMPRESA
		   AND EL.CORR_EMPLEADO = EP.CORR_EMPLEADO
		WHERE EP.CORR_EMPRESA = @CORR_EMPRESA
	),
	UnidadesComoJefe AS
	(
		-- Qué hace: unidades donde el empleado es jefe activo.
		-- Cómo: SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES con ACTIVO = 1.
		--       Ejemplo: Coordinador de Desarrollo que además es jefe de Subgerencia
		--       ve Subgerencia aunque su puesto no esté ahí.
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
	UnidadesConfiguradas AS
	(
		-- Qué hace: unidades configuradas manualmente al usuario en la empresa.
		-- Cómo: lee SC_UNIDADES_USUARIO por CORR_EMPRESA + LOGIN_SISTEMA.
		SELECT DISTINCT
			SU.CORR_EMPRESA,
			SU.CORR_UNIDAD
		FROM dbo.SC_UNIDADES_USUARIO SU
		WHERE SU.CORR_EMPRESA = @CORR_EMPRESA
		  AND LTRIM(RTRIM(SU.LOGIN_SISTEMA)) = @LOGIN
	),
	UnidadesUnion AS
	(
		-- Qué hace: une las tres fuentes sin repetir unidad.
		-- Cómo: UNION elimina duplicados de (CORR_EMPRESA, CORR_UNIDAD).
		SELECT CORR_EMPRESA, CORR_UNIDAD FROM UnidadesPorPuesto
		UNION
		SELECT CORR_EMPRESA, CORR_UNIDAD FROM UnidadesComoJefe
		UNION
		SELECT CORR_EMPRESA, CORR_UNIDAD FROM UnidadesConfiguradas
	)
	SELECT
		U.CORR_EMPRESA,
		U.CORR_UNIDAD,
		O.CODIGO_UNIDAD,
		O.NOMBRE_UNIDAD,
		@LOGIN AS LOGIN_SISTEMA,
		CONVERT(BIT, CASE WHEN PP.CORR_UNIDAD IS NOT NULL THEN 1 ELSE 0 END) AS ES_POR_PUESTO,
		CONVERT(BIT, CASE WHEN JF.CORR_UNIDAD IS NOT NULL THEN 1 ELSE 0 END) AS ES_JEFE_UNIDAD,
		CONVERT(BIT, CASE WHEN CF.CORR_UNIDAD IS NOT NULL THEN 1 ELSE 0 END) AS ES_CONFIGURADA
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
EJEMPLOS DE PRUEBA
================================================================================

-- Cesar Lopez (CORR_EMPLEADO=4): puesto en unidad 5 + jefe activo en 5 y 6
-- + config SC 1..8 → 1..8 una vez; 5 y 6 con ES_JEFE_UNIDAD=1
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'cesar.lopez';

-- Daniel Palacios: por puesto y/o jefe activo (sin SC_UNIDADES_USUARIO)
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'dpalacios';

-- Solo configuración
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'alexanderr';
*/
