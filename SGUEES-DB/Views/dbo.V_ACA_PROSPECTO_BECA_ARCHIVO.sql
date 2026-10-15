-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_BECA_ARCHIVO (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/* ==========================================================================
   V_ACA_PROSPECTO_BECA_ARCHIVO
   Qué hace: archivos que el prospecto cargó en preguntas tipo documento.
   Cómo lo hace: la carpeta del servidor es {año}-{período}_{CORR_PROSPECTO_BECA}
             bajo \\192.168.1.8\admision\Documentacion Becas. ARCHIVO_RUTA guarda
             la ruta completa; la pantalla abre el archivo por la respuesta.
   ========================================================================== */
CREATE   VIEW dbo.V_ACA_PROSPECTO_BECA_ARCHIVO
AS
SELECT
    R.CORR_EMPRESA,
    R.CORR_PROSPECTO_BECA,
    R.CORR_RESPUESTA_BECA,
    PA.ANIO,
    PA.NUMERO_PERIODO,
    CAST(PA.ANIO AS VARCHAR(4)) + '-' + CAST(PA.NUMERO_PERIODO AS VARCHAR(2))
        + '_' + CAST(PB.CORR_PROSPECTO_BECA AS VARCHAR(12)) AS CARPETA,
    S.ORDEN AS ORDEN_SECCION,
    S.NOMBRE_SECCION,
    P.ORDEN AS ORDEN_PREGUNTA,
    P.CORR_PREGUNTA_BECA,
    P.TEXTO_PREGUNTA,
    R.ARCHIVO_NOMBRE,
    R.ARCHIVO_RUTA
FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA AS R
INNER JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA AS P
    ON P.CORR_PREGUNTA_BECA = R.CORR_PREGUNTA_BECA
INNER JOIN dbo.ACA_PROSPECTO_BECA_SECCION AS S
    ON S.CORR_SECCION_BECA = P.CORR_SECCION_BECA
INNER JOIN dbo.ACA_PROSPECTO_BECA AS PB
    ON PB.CORR_PROSPECTO_BECA = R.CORR_PROSPECTO_BECA
INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS AS PA
    ON PA.CORR_PERIODO_ACADEMICO = PB.CORR_PERIODO_ACADEMICO
WHERE PB.ESTADO_BECA IN ('BORRADOR', 'ENVIADA')
  AND P.TIPO_RESPUESTA = 'DOCUMENTO'
  AND NULLIF(LTRIM(RTRIM(R.ARCHIVO_NOMBRE)), '') IS NOT NULL;

GO
