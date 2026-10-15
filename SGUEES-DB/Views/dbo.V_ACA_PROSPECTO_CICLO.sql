-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_CICLO (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/* ==========================================================================
   BLOQUE 1.2 — V_ACA_PROSPECTO_CICLO (combo de ciclos)
   Qué hace: lista los ciclos de pregrado (año + número de período) y marca
             cuál se selecciona por defecto en la pantalla.
   Cómo lo hace: agrupa ACA_PERIODOS_ACADEMICOS por ANIO + NUMERO_PERIODO,
             porque un ciclo tiene varias filas (general, por facultad y por
             carrera). ES_CICLO_DEFECTO usa la misma regla que admisiones
             (NI_LIST_CATALOGS opción 20): período activo con fin de
             inscripción hoy o después, el más próximo. Si no hay ninguno,
             el ciclo más reciente con prospectos; si tampoco, el más
             reciente.
   ========================================================================== */
CREATE   VIEW dbo.V_ACA_PROSPECTO_CICLO
AS
WITH CICLOS AS (
    SELECT
        AA.CORR_EMPRESA,
        PA.ANIO,
        PA.NUMERO_PERIODO,
        PA.ANIO * 100 + PA.NUMERO_PERIODO AS CLAVE_CICLO,
        MAX(CASE
                WHEN PA.ACTIVO = 1 AND PA.FECHA_FIN_INSCRIPCION >= CAST(GETDATE() AS DATE) THEN 1
                ELSE 0
            END) AS EN_ADMISION,
        COUNT(P.CORR_PROSPECTO) AS CANTIDAD_PROSPECTOS
    FROM dbo.ACA_PERIODOS_ACADEMICOS AS PA
    INNER JOIN dbo.ACA_AREAS_ACADEMICAS AS AA
        ON AA.CORR_AREA_ACADEMICA = PA.CORR_AREA_ACADEMICA
    LEFT JOIN dbo.ACA_PROSPECTO AS P
        ON P.CORR_PERIODO_ACADEMICO = PA.CORR_PERIODO_ACADEMICO
    WHERE PA.CORR_AREA_ACADEMICA = 5
    GROUP BY AA.CORR_EMPRESA, PA.ANIO, PA.NUMERO_PERIODO
)
SELECT
    C.CORR_EMPRESA,
    CAST(C.ANIO AS VARCHAR(4)) + '-' + RIGHT('0' + CAST(C.NUMERO_PERIODO AS VARCHAR(2)), 2) AS CICLO,
    C.ANIO,
    C.NUMERO_PERIODO,
    'Ciclo ' + RIGHT('0' + CAST(C.NUMERO_PERIODO AS VARCHAR(2)), 2) + ' - ' + CAST(C.ANIO AS VARCHAR(4)) AS NOMBRE_CICLO,
    C.CLAVE_CICLO,
    C.CANTIDAD_PROSPECTOS,
    CAST(CASE
            WHEN C.CLAVE_CICLO = COALESCE(
                (SELECT MIN(X.CLAVE_CICLO) FROM CICLOS AS X
                  WHERE X.CORR_EMPRESA = C.CORR_EMPRESA AND X.EN_ADMISION = 1),
                (SELECT MAX(X.CLAVE_CICLO) FROM CICLOS AS X
                  WHERE X.CORR_EMPRESA = C.CORR_EMPRESA AND X.CANTIDAD_PROSPECTOS > 0),
                (SELECT MAX(X.CLAVE_CICLO) FROM CICLOS AS X
                  WHERE X.CORR_EMPRESA = C.CORR_EMPRESA))
            THEN 1
            ELSE 0
         END AS BIT) AS ES_CICLO_DEFECTO
FROM CICLOS AS C;

GO
