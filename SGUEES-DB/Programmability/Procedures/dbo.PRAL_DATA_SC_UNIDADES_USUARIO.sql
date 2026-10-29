SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Qué hace: Devuelve las unidades del usuario por empresa (sin duplicar
--   unidad+puesto) a partir de:
--   1) Unidades y puesto en GEN_EMPLEADO_PUESTO (CORR_UNIDAD + CORR_PUESTO).
--   2) Unidades donde es jefe activo (SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES).
--   3) Unidades hijas (descendientes) de aquellas donde es jefe activo.
--   4) Unidades configuradas en SC_UNIDADES_USUARIO.
-- Cómo lo hace: Filtra por @CORR_EMPRESA y @LOGIN_SISTEMA, resuelve el empleado
--   vía GEN_PERSONA_USUARIO, une las fuentes con UNION y enriquece con organigrama
--   y PLA_PUESTO. Las hijas se obtienen con CTE recursiva desde las unidades
--   de jefatura. ES_HIJA_A_CARGO = 1 solo en descendientes (no en la unidad
--   donde es jefe directo).
--   Si tiene puesto en esa unidad: muestra CORR_PUESTO y NOMBRE_PUESTO.
--   Si solo es jefe, hija a cargo o configurada: CORR_PUESTO NULL y NOMBRE_PUESTO =
--   'No lo tiene por puesto de trabajo'.
-- Nota: No ejecutar CREATE en el servidor desde el agente; el DBA/usuario lo aplica.
-- =============================================================================
CREATE OR ALTER PROCEDURE [dbo].[PRAL_DATA_SC_UNIDADES_USUARIO]
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
		-- Cómo: GEN_EMPLEADO + GEN_PERSONA_USUARIO por LOGIN_SISTEMA.
		SELECT
			E.CORR_EMPRESA,
			E.CORR_EMPLEADO
		FROM dbo.GEN_EMPLEADO E
		INNER JOIN dbo.GEN_PERSONA_USUARIO PU
			ON PU.CORR_PERSONA = E.CORR_PERSONA
		WHERE E.CORR_EMPRESA = @CORR_EMPRESA
		  AND LTRIM(RTRIM(PU.LOGIN_SISTEMA)) = @LOGIN
	),
	UnidadesPorPuesto AS
	(
		-- Qué hace: unidades y puesto donde el empleado trabaja.
		-- Cómo: lee CORR_UNIDAD y CORR_PUESTO de GEN_EMPLEADO_PUESTO.
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
		-- Qué hace: unidades donde el empleado es jefe activo (jefatura directa).
		-- Cómo: SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES con ACTIVO = 1.
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
	UnidadesHijasACargo AS
	(
		-- Qué hace: descendientes (hijas, nietas, …) de las unidades donde es jefe.
		-- Cómo: CTE recursiva por CORR_UNIDAD_PADRE; excluye la unidad de jefatura directa.
		SELECT
			H.CORR_EMPRESA,
			H.CORR_UNIDAD,
			H.CORR_UNIDAD_PADRE,
			0 AS NIVEL
		FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES H
		INNER JOIN UnidadesComoJefe J
			ON J.CORR_EMPRESA = H.CORR_EMPRESA
		   AND J.CORR_UNIDAD = H.CORR_UNIDAD_PADRE
		WHERE H.CORR_EMPRESA = @CORR_EMPRESA

		UNION ALL

		SELECT
			H.CORR_EMPRESA,
			H.CORR_UNIDAD,
			H.CORR_UNIDAD_PADRE,
			P.NIVEL + 1
		FROM dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES H
		INNER JOIN UnidadesHijasACargo P
			ON P.CORR_EMPRESA = H.CORR_EMPRESA
		   AND P.CORR_UNIDAD = H.CORR_UNIDAD_PADRE
		WHERE H.CORR_EMPRESA = @CORR_EMPRESA
		  AND P.NIVEL < 20
	),
	UnidadesHijasACargoDist AS
	(
		SELECT DISTINCT CORR_EMPRESA, CORR_UNIDAD
		FROM UnidadesHijasACargo
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
		-- Qué hace: une las fuentes sin repetir unidad+puesto.
		-- Cómo: filas de puesto traen CORR_PUESTO; jefe/hija/config sin puesto
		--       en esa unidad salen con NULL. UNION elimina duplicados.
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

		SELECT H.CORR_EMPRESA, H.CORR_UNIDAD, CONVERT(INT, NULL)
		FROM UnidadesHijasACargoDist H
		WHERE NOT EXISTS
		(
			SELECT 1
			FROM UnidadesPorPuesto P
			WHERE P.CORR_EMPRESA = H.CORR_EMPRESA
			  AND P.CORR_UNIDAD = H.CORR_UNIDAD
		)
		  AND NOT EXISTS
		(
			SELECT 1
			FROM UnidadesComoJefe J
			WHERE J.CORR_EMPRESA = H.CORR_EMPRESA
			  AND J.CORR_UNIDAD = H.CORR_UNIDAD
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
		  AND NOT EXISTS
		(
			SELECT 1
			FROM UnidadesComoJefe J
			WHERE J.CORR_EMPRESA = C.CORR_EMPRESA
			  AND J.CORR_UNIDAD = C.CORR_UNIDAD
		)
		  AND NOT EXISTS
		(
			SELECT 1
			FROM UnidadesHijasACargoDist H
			WHERE H.CORR_EMPRESA = C.CORR_EMPRESA
			  AND H.CORR_UNIDAD = C.CORR_UNIDAD
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
		-- Qué hace: marca unidades descendientes bajo su jefatura (a cargo por ser jefe del padre).
		CONVERT(BIT, CASE WHEN HJ.CORR_UNIDAD IS NOT NULL THEN 1 ELSE 0 END) AS ES_HIJA_A_CARGO,
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
	LEFT JOIN UnidadesHijasACargoDist HJ
		ON HJ.CORR_EMPRESA = U.CORR_EMPRESA
	   AND HJ.CORR_UNIDAD = U.CORR_UNIDAD
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

-- Jonathan Avalos: jefe de Tecnología (5) → debe traer hijas 6 y 8 con ES_HIJA_A_CARGO=1
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'jonathan.avalos';

-- Cesar Lopez
EXEC dbo.PRAL_DATA_SC_UNIDADES_USUARIO
	@CORR_EMPRESA = 1,
	@LOGIN_SISTEMA = 'cesar.lopez';
*/
