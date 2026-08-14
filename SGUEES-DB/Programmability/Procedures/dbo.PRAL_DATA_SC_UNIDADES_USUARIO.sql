SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Qué hace: Devuelve las unidades del usuario por empresa (sin duplicar
--   unidad+puesto) a partir de:
--   1) Unidades y puesto en GEN_EMPLEADO_PUESTO (CORR_UNIDAD + CORR_PUESTO).
--   2) Unidades donde es jefe activo (SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES).
--   3) Unidades configuradas en SC_UNIDADES_USUARIO.
-- Cómo lo hace: Filtra por @CORR_EMPRESA y @LOGIN_SISTEMA, resuelve el empleado
--   por LOGIN_SISTEMA / LOGIN_SISTEMA_WEB, une las tres fuentes con UNION y
--   enriquece con organigrama y PLA_PUESTO.
--   Si tiene puesto en esa unidad: muestra CORR_PUESTO y NOMBRE_PUESTO.
--   Si solo es jefe o configurada: CORR_PUESTO NULL y NOMBRE_PUESTO =
--   'No lo tiene por puesto de trabajo'.
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
	DECLARE @MSG_SIN_PUESTO VARCHAR(80) = 'No lo tiene por puesto de trabajo';

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
		-- Qué hace: unidades y puesto donde el empleado trabaja.
		-- Cómo: lee CORR_UNIDAD y CORR_PUESTO de GEN_EMPLEADO_PUESTO
		--       (ya no hay ESTADO_EMPLEADO_PUESTO).
		SELECT DISTINCT
			EP.CORR_EMPRESA,
			EP.CORR_UNIDAD,
			EP.CORR_PUESTO
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
		-- Qué hace: une las tres fuentes sin repetir unidad+puesto.
		-- Cómo: filas de puesto traen CORR_PUESTO; jefe/config sin puesto en esa
		--       unidad salen con NULL. UNION elimina duplicados.
		SELECT CORR_EMPRESA, CORR_UNIDAD, CORR_PUESTO
		FROM UnidadesPorPuesto

		UNION

		SELECT J.CORR_EMPRESA, J.CORR_UNIDAD, CONVERT(INT, NULL)
		FROM UnidadesComoJefe J
		WHERE NOT EXISTS
		(
			SELECT 1
			FROM UnidadesPorPuesto P
			WHERE P.CORR_EMPRESA = J.CORR_EMPRESA
			  AND P.CORR_UNIDAD = J.CORR_UNIDAD
		)

		UNION

		SELECT C.CORR_EMPRESA, C.CORR_UNIDAD, CONVERT(INT, NULL)
		FROM UnidadesConfiguradas C
		WHERE NOT EXISTS
		(
			SELECT 1
			FROM UnidadesPorPuesto P
			WHERE P.CORR_EMPRESA = C.CORR_EMPRESA
			  AND P.CORR_UNIDAD = C.CORR_UNIDAD
		)
	)
	SELECT
		U.CORR_EMPRESA,
		U.CORR_UNIDAD,
		O.CODIGO_UNIDAD,
		O.NOMBRE_UNIDAD,
		U.CORR_PUESTO,
		CASE
			WHEN U.CORR_PUESTO IS NULL THEN @MSG_SIN_PUESTO
			ELSE ISNULL(P.NOMBRE_PUESTO, @MSG_SIN_PUESTO)
		END AS NOMBRE_PUESTO,
		@LOGIN AS LOGIN_SISTEMA,
		CONVERT(BIT, CASE WHEN U.CORR_PUESTO IS NOT NULL THEN 1 ELSE 0 END) AS ES_POR_PUESTO,
		CONVERT(BIT, CASE WHEN JF.CORR_UNIDAD IS NOT NULL THEN 1 ELSE 0 END) AS ES_JEFE_UNIDAD,
		CONVERT(BIT, CASE WHEN CF.CORR_UNIDAD IS NOT NULL THEN 1 ELSE 0 END) AS ES_CONFIGURADA
	FROM UnidadesUnion U
	LEFT JOIN dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES O
		ON O.CORR_EMPRESA = U.CORR_EMPRESA
	   AND O.CORR_UNIDAD = U.CORR_UNIDAD
	LEFT JOIN dbo.PLA_PUESTO P
		ON P.CORR_EMPRESA = U.CORR_EMPRESA
	   AND P.CORR_PUESTO = U.CORR_PUESTO
	LEFT JOIN UnidadesComoJefe JF
		ON JF.CORR_EMPRESA = U.CORR_EMPRESA
	   AND JF.CORR_UNIDAD = U.CORR_UNIDAD
	LEFT JOIN UnidadesConfiguradas CF
		ON CF.CORR_EMPRESA = U.CORR_EMPRESA
	   AND CF.CORR_UNIDAD = U.CORR_UNIDAD
	ORDER BY U.CORR_EMPRESA, O.CODIGO_UNIDAD, U.CORR_UNIDAD, U.CORR_PUESTO;
END
GO

/*
================================================================================
EJEMPLOS DE PRUEBA
================================================================================

-- Cesar Lopez (CORR_EMPLEADO=4): puesto en unidad 5 + jefe activo en 5 y 6
-- + config SC 1..8 → 1..8 una vez; unidad 5 con NOMBRE_PUESTO real;
-- unidades solo jefe/config con NOMBRE_PUESTO = 'No lo tiene por puesto de trabajo'
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'cesar.lopez';

-- Daniel Palacios: por puesto y/o jefe activo (sin SC_UNIDADES_USUARIO)
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'dpalacios';

-- Solo configuración → todas las filas con el mensaje (no tiene puesto ahí)
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'alexanderr';
*/
