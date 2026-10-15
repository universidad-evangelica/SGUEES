-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_SOCIOECONOMICO (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/* --------------------------------------------------------------------------
   BLOQUE 4.3 — V_ACA_PROSPECTO_SOCIOECONOMICO
   Qué hace: cabecera del estudio socioeconómico (versión, términos, cuota
             máxima, fechas) con el avance de preguntas respondidas.
   Cómo lo hace: toma ACA_PROSPECTO_SOCIOECONOMICO y cuenta sobre
             V_ACA_PROSPECTO_SE_RESPUESTA, para que el total y lo respondido
             usen exactamente la misma regla que la lista de preguntas.
             CORR_TIPO_INSTITUCION repite la respuesta a CENTRO_EDUCATIVO;
             la pantalla muestra la respuesta (con su texto histórico).
   -------------------------------------------------------------------------- */
CREATE   VIEW dbo.V_ACA_PROSPECTO_SOCIOECONOMICO
AS
SELECT
    VP.CORR_EMPRESA,
    VP.CORR_PROSPECTO,
    S.CORR_PROSPECTO_PERSONA,
    S.CORR_PROSPECTO_SOCIOECONOMICO,
    S.CORR_VERSION,
    V.CODIGO AS CODIGO_VERSION,
    V.NOMBRE AS NOMBRE_VERSION,
    S.TERMINOS_ACEPTADOS,
    S.APLICA_CUOTA_MAXIMA,
    S.CORR_TIPO_INSTITUCION,
    TI.NOMBRE AS TIPO_INSTITUCION_NOMBRE,
    S.FECHA_CREA AS FECHA_REGISTRO,
    S.FECHA_ACTU AS FECHA_ACTUALIZACION,
    ISNULL(RS.TOTAL_PREGUNTAS, 0) AS TOTAL_PREGUNTAS,
    ISNULL(RS.PREGUNTAS_RESPONDIDAS, 0) AS PREGUNTAS_RESPONDIDAS
FROM dbo.V_ACA_PROSPECTO AS VP
INNER JOIN dbo.ACA_PROSPECTO_SOCIOECONOMICO AS S
    ON S.CORR_PROSPECTO_PERSONA = VP.CORR_PROSPECTO_PERSONA
LEFT JOIN dbo.ACA_SE_VERSION AS V
    ON V.CORR_VERSION = S.CORR_VERSION
LEFT JOIN dbo.GEN_TIPO_INSTITUCION AS TI
    ON TI.CORR_TIPO_INSTITUCION = S.CORR_TIPO_INSTITUCION
LEFT JOIN (
    SELECT
        CORR_PROSPECTO_SOCIOECONOMICO,
        COUNT(*) AS TOTAL_PREGUNTAS,
        SUM(CAST(TIENE_RESPUESTA AS INT)) AS PREGUNTAS_RESPONDIDAS
    FROM dbo.V_ACA_PROSPECTO_SE_RESPUESTA
    GROUP BY CORR_PROSPECTO_SOCIOECONOMICO
) AS RS
    ON RS.CORR_PROSPECTO_SOCIOECONOMICO = S.CORR_PROSPECTO_SOCIOECONOMICO;

GO
