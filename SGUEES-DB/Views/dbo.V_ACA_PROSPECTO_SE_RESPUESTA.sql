-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_SE_RESPUESTA (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/* --------------------------------------------------------------------------
   BLOQUE 4.2 — V_ACA_PROSPECTO_SE_RESPUESTA
   Qué hace: todas las preguntas de la versión del cuestionario con la que
             el prospecto llenó su estudio socioeconómico, con su respuesta
             si la tiene. Las preguntas sin contestar también aparecen.
   Cómo lo hace: parte de ACA_SE_VERSION_PREGUNTA de la versión congelada en
             la ficha (no de las respuestas), así una versión nueva no
             requiere cambios. Incluye preguntas activas en la versión y las
             ya respondidas aunque luego se desactiven. El enunciado y el
             texto de la opción salen del histórico guardado al responder; si
             no hay respuesta, del banco. Las opciones múltiples se juntan en
             un texto. TIENE_RESPUESTA = 1 si hay algún valor guardado.
             Nota: admisiones no guarda montos en cero, así que "$0" y "sin
             respuesta" se ven igual.
   -------------------------------------------------------------------------- */
CREATE   VIEW dbo.V_ACA_PROSPECTO_SE_RESPUESTA
AS
SELECT
    VP.CORR_EMPRESA,
    VP.CORR_PROSPECTO,
    S.CORR_PROSPECTO_SOCIOECONOMICO,
    S.CORR_VERSION,
    VPR.CORR_VERSION_PREGUNTA,
    VPR.ORDEN,
    VPR.ES_REQUERIDO,
    P.CORR_PREGUNTA,
    P.CODIGO AS CODIGO_PREGUNTA,
    P.CORR_TIPO_PREGUNTA,
    T.CODIGO AS TIPO_PREGUNTA,
    T.NOMBRE AS TIPO_PREGUNTA_NOMBRE,
    COALESCE(R.TEXTO_PREGUNTA_HISTORICO, P.ENUNCIADO) AS ENUNCIADO,
    P.AYUDA,
    R.CORR_RESPUESTA,
    R.VALOR_TEXTO,
    R.VALOR_NUMERO,
    R.VALOR_BIT,
    R.CORR_OPCION,
    COALESCE(R.TEXTO_OPCION_HISTORICO, OP.TEXTO) AS TEXTO_OPCION,
    STUFF((
        SELECT N', ' + COALESCE(RO.TEXTO_OPCION_HISTORICO, O2.TEXTO)
        FROM dbo.ACA_PROSPECTO_SE_RESPUESTA_OPCION AS RO
        LEFT JOIN dbo.ACA_SE_OPCION AS O2
            ON O2.CORR_OPCION = RO.CORR_OPCION
        WHERE RO.CORR_RESPUESTA = R.CORR_RESPUESTA
        ORDER BY O2.ORDEN
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, N'') AS TEXTO_OPCIONES_MULTIPLES,
    CAST(CASE
            WHEN R.CORR_RESPUESTA IS NULL THEN 0
            WHEN NULLIF(LTRIM(RTRIM(R.VALOR_TEXTO)), '') IS NOT NULL
              OR R.VALOR_NUMERO IS NOT NULL
              OR R.VALOR_BIT IS NOT NULL
              OR R.CORR_OPCION IS NOT NULL
              OR EXISTS (SELECT 1
                         FROM dbo.ACA_PROSPECTO_SE_RESPUESTA_OPCION AS RO
                         WHERE RO.CORR_RESPUESTA = R.CORR_RESPUESTA)
            THEN 1
            ELSE 0
         END AS BIT) AS TIENE_RESPUESTA,
    R.FECHA_RESPUESTA
FROM dbo.V_ACA_PROSPECTO AS VP
INNER JOIN dbo.ACA_PROSPECTO_SOCIOECONOMICO AS S
    ON S.CORR_PROSPECTO_PERSONA = VP.CORR_PROSPECTO_PERSONA
INNER JOIN dbo.ACA_SE_VERSION_PREGUNTA AS VPR
    ON VPR.CORR_VERSION = S.CORR_VERSION
INNER JOIN dbo.ACA_SE_PREGUNTA AS P
    ON P.CORR_PREGUNTA = VPR.CORR_PREGUNTA
LEFT JOIN dbo.GEN_SE_TIPO_PREGUNTA AS T
    ON T.CORR_TIPO_PREGUNTA = P.CORR_TIPO_PREGUNTA
LEFT JOIN dbo.ACA_PROSPECTO_SE_RESPUESTA AS R
    ON R.CORR_PROSPECTO_SOCIOECONOMICO = S.CORR_PROSPECTO_SOCIOECONOMICO
   AND R.CORR_PREGUNTA = P.CORR_PREGUNTA
LEFT JOIN dbo.ACA_SE_OPCION AS OP
    ON OP.CORR_OPCION = R.CORR_OPCION
WHERE VPR.ACTIVO = 1
   OR R.CORR_RESPUESTA IS NOT NULL;

GO
