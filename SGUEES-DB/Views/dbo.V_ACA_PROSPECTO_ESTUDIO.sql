-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_ESTUDIO (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/* ==========================================================================
   BLOQUE 3 — Pestaña "Información académica"
   ========================================================================== */

/* --------------------------------------------------------------------------
   BLOQUE 3.1 — V_ACA_PROSPECTO_ESTUDIO
   Qué hace: estudios previos del prospecto, agrupados en las mismas tres
             secciones del formulario de admisiones.
   Cómo lo hace: admisiones guarda como máximo una fila por sección
             (índice único UX_ACA_PROSP_EST_PERSONA_NIVEL_UEES):
             - NIVEL_ESTUDIO = 'MEDIO'                 → MEDIA (bachillerato)
             - NIVEL_ESTUDIO = 'SUPERIOR', no UEES     → UNIVERSIDAD
             - NIVEL_ESTUDIO = 'SUPERIOR', GRADUADO_UEES → GRADUADO_UEES
             SECCION / SECCION_TEXTO / ORDEN_SECCION permiten pintarlas en
             ese orden. Resuelve tipo de institución, grado académico,
             carrera UEES, país, depto y municipio (estos dos por su llave
             compuesta).
   -------------------------------------------------------------------------- */
CREATE   VIEW dbo.V_ACA_PROSPECTO_ESTUDIO
AS
SELECT
    VP.CORR_EMPRESA,
    VP.CORR_PROSPECTO,
    E.CORR_PROSPECTO_PERSONA,
    E.CORR_PROSPECTO_ESTUDIO,
    E.NIVEL_ESTUDIO,
    CASE
        WHEN E.NIVEL_ESTUDIO = 'MEDIO' THEN 'MEDIA'
        WHEN E.GRADUADO_UEES = 1 THEN 'GRADUADO_UEES'
        ELSE 'UNIVERSIDAD'
    END AS SECCION,
    CASE
        WHEN E.NIVEL_ESTUDIO = 'MEDIO' THEN N'Educación media (bachillerato)'
        WHEN E.GRADUADO_UEES = 1 THEN N'Graduado UEES'
        ELSE N'Estudios universitarios'
    END AS SECCION_TEXTO,
    CASE
        WHEN E.NIVEL_ESTUDIO = 'MEDIO' THEN 1
        WHEN E.GRADUADO_UEES = 1 THEN 3
        ELSE 2
    END AS ORDEN_SECCION,
    E.NOMBRE_INSTITUCION,
    E.CORR_TIPO_INSTITUCION,
    TI.NOMBRE AS TIPO_INSTITUCION_NOMBRE,
    E.TIPO_INSTITUCION,
    E.TIPO_EDUCACION,
    E.TITULO_OBTENIDO,
    E.CORR_GRADO_ACADEMICO,
    GA.NOMBRE_GRADO,
    E.CORR_CARRERA,
    CA.NOMBRE_CARRERA,
    E.CARRERA_TEXTO,
    E.NIVEL_CURSADO,
    E.BACHILLER_OPCION,
    E.ANIO_TITULACION,
    E.FECHA_EGRESO,
    E.FECHA_GRADUACION,
    E.CUOTA,
    E.QUIEN_PAGO_CUOTA,
    E.GRADUADO,
    E.GRADUADO_UEES,
    E.CORR_PAIS,
    PA.NOMBRE_PAIS,
    E.CORR_DEPTO,
    DP.NOMBRE_DEPTO,
    E.CORR_MUNICIPIO,
    MU.NOMBRE_MUNICIPIO
FROM dbo.V_ACA_PROSPECTO AS VP
INNER JOIN dbo.ACA_PROSPECTO_ESTUDIO AS E
    ON E.CORR_PROSPECTO_PERSONA = VP.CORR_PROSPECTO_PERSONA
LEFT JOIN dbo.GEN_TIPO_INSTITUCION AS TI
    ON TI.CORR_TIPO_INSTITUCION = E.CORR_TIPO_INSTITUCION
LEFT JOIN dbo.ACA_GRADOS_ACADEMICOS AS GA
    ON GA.CORR_GRADO_ACADEMICO = E.CORR_GRADO_ACADEMICO
LEFT JOIN dbo.ACA_CARRERAS AS CA
    ON CA.CORR_CARRERA = E.CORR_CARRERA
LEFT JOIN dbo.GEN_PAIS AS PA
    ON PA.CORR_PAIS = E.CORR_PAIS
LEFT JOIN dbo.GEN_DEPTO AS DP
    ON DP.CORR_PAIS = E.CORR_PAIS
   AND DP.CORR_DEPTO = E.CORR_DEPTO
LEFT JOIN dbo.GEN_MUNICIPIO AS MU
    ON MU.CORR_PAIS = E.CORR_PAIS
   AND MU.CORR_DEPTO = E.CORR_DEPTO
   AND MU.CORR_MUNICIPIO = E.CORR_MUNICIPIO;

GO
