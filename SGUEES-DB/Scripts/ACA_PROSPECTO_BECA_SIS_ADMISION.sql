/* ==========================================================================
   Consulta de becas sobre SIS_ADMISION (192.168.0.8)
   Qué hace: las mismas tres vistas que usa la pantalla de SGUEES, leyendo
             lo que guarda sis-admision (rama FORM-BECAS-SGUEES).
   Cómo lo hace: el prospecto sale de PersonalInformations (Cif, nombres,
             carrera). El puntaje, el resultado y la prioridad son los que
             ya guardó el formulario. La carpeta del archivo es la que
             quedó en ARCHIVO_RUTA ({año}-{período}_{Cif}).
   Ejecutar: sqlcmd -S 192.168.0.8 -d SIS_ADMISION -f 65001 -i este archivo
   ========================================================================== */
USE SIS_ADMISION;
GO

/* ==========================================================================
   V_ACA_PROSPECTO_BECA_CICLO
   Qué hace: ciclos que tienen solicitudes, para el combo de la pantalla.
   Cómo lo hace: agrupa año y período de las solicitudes en borrador o
             enviadas. El ciclo más reciente queda como predeterminado.
   ========================================================================== */
IF OBJECT_ID(N'dbo.V_ACA_PROSPECTO_BECA_CICLO', N'V') IS NOT NULL
    DROP VIEW dbo.V_ACA_PROSPECTO_BECA_CICLO;
GO
CREATE VIEW dbo.V_ACA_PROSPECTO_BECA_CICLO
AS
WITH CICLOS AS (
    SELECT
        ISNULL(PB.CORR_EMPRESA, 1) AS CORR_EMPRESA,
        CAST(PA.ANIO AS smallint) AS ANIO,
        CAST(PA.NUMERO_PERIODO AS tinyint) AS NUMERO_PERIODO,
        CAST(PA.ANIO AS int) * 100 + CAST(PA.NUMERO_PERIODO AS int) AS CLAVE_CICLO,
        COUNT(*) AS CANTIDAD_PROSPECTOS
    FROM dbo.ACA_PROSPECTO_BECA AS PB
    INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS AS PA
        ON PA.CORR_PERIODO_ACADEMICO = PB.CORR_PERIODO_ACADEMICO
    WHERE PB.ESTADO_BECA IN ('BORRADOR', 'ENVIADA')
      AND ISNULL(PB.ACTIVO, 1) = 1
    GROUP BY ISNULL(PB.CORR_EMPRESA, 1), PA.ANIO, PA.NUMERO_PERIODO
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
            WHEN C.CLAVE_CICLO = (
                SELECT MAX(X.CLAVE_CICLO)
                FROM CICLOS AS X
                WHERE X.CORR_EMPRESA = C.CORR_EMPRESA)
            THEN 1
            ELSE 0
         END AS bit) AS ES_CICLO_DEFECTO
FROM CICLOS AS C;
GO

/* ==========================================================================
   V_ACA_PROSPECTO_BECA_CONSULTA
   Qué hace: una fila por solicitud en borrador o enviada.
   Cómo lo hace: une la solicitud con PersonalInformations, el tipo de beca
             y el período. Muestra el puntaje guardado por el formulario.
   ========================================================================== */
IF OBJECT_ID(N'dbo.V_ACA_PROSPECTO_BECA_CONSULTA', N'V') IS NOT NULL
    DROP VIEW dbo.V_ACA_PROSPECTO_BECA_CONSULTA;
GO
CREATE VIEW dbo.V_ACA_PROSPECTO_BECA_CONSULTA
AS
SELECT
    ISNULL(PB.CORR_EMPRESA, 1) AS CORR_EMPRESA,
    PB.CORR_PROSPECTO_BECA,
    PB.CORR_PROSPECTO,
    COALESCE(
        NULLIF(LTRIM(RTRIM(PB.Cif)), ''),
        NULLIF(LTRIM(RTRIM(P.Cif)), ''),
        CAST(PB.CORR_PROSPECTO AS varchar(20))) AS CODIGO_PROSPECTO,
    LTRIM(RTRIM(
        ISNULL(LTRIM(RTRIM(P.Names)) + ' ', '')
        + ISNULL(LTRIM(RTRIM(P.FirstLastName)) + ' ', '')
        + ISNULL(LTRIM(RTRIM(P.SecondLastName)), ''))) AS NOMBRE_COMPLETO,
    ISNULL(P.DUI, '') AS DUI,
    COALESCE(NULLIF(LTRIM(RTRIM(P.CareerName)), ''), NULLIF(LTRIM(RTRIM(P.CareerCode)), ''), '') AS NOMBRE_CARRERA,
    PB.CORR_BECA,
    BT.CODIGO_BECA,
    BT.NOMBRE_BECA,
    PB.CORR_PERIODO_ACADEMICO,
    CAST(PA.ANIO AS smallint) AS ANIO,
    CAST(PA.NUMERO_PERIODO AS tinyint) AS NUMERO_PERIODO,
    CAST(PA.ANIO AS VARCHAR(4)) + '-' + RIGHT('0' + CAST(PA.NUMERO_PERIODO AS VARCHAR(2)), 2) AS CICLO,
    PB.ESTADO_BECA,
    CASE PB.ESTADO_BECA
        WHEN 'BORRADOR' THEN 'Borrador'
        WHEN 'ENVIADA' THEN 'Enviada'
        ELSE PB.ESTADO_BECA
    END AS ESTADO_BECA_TEXTO,
    CAST(ISNULL(PB.PUNTAJE_TOTAL, 0) AS decimal(10, 2)) AS PUNTAJE_TOTAL,
    CAST(ISNULL(PB.PORCENTAJE_TOTAL, 0) AS decimal(5, 2)) AS PORCENTAJE_TOTAL,
    PB.RESULTADO_EVALUACION,
    PB.PRIORIDAD_EVALUACION,
    ISNULL(PB.FECHA_SOLICITUD, PB.FECHA_CREA) AS FECHA_SOLICITUD
FROM dbo.ACA_PROSPECTO_BECA AS PB
LEFT JOIN dbo.PersonalInformations AS P
    ON P.InformationId = PB.CORR_PROSPECTO
INNER JOIN dbo.ACA_BECA_TIPO AS BT
    ON BT.CORR_BECA = PB.CORR_BECA
INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS AS PA
    ON PA.CORR_PERIODO_ACADEMICO = PB.CORR_PERIODO_ACADEMICO
WHERE PB.ESTADO_BECA IN ('BORRADOR', 'ENVIADA')
  AND ISNULL(PB.ACTIVO, 1) = 1;
GO

/* ==========================================================================
   V_ACA_PROSPECTO_BECA_RESPUESTA
   Qué hace: cada respuesta del cuestionario, sin los documentos.
   Cómo lo hace: el puntaje es el guardado. Aceptación muestra el texto
             "Acepto". La API filtra por empresa y solicitud.
   ========================================================================== */
IF OBJECT_ID(N'dbo.V_ACA_PROSPECTO_BECA_RESPUESTA', N'V') IS NOT NULL
    DROP VIEW dbo.V_ACA_PROSPECTO_BECA_RESPUESTA;
GO
CREATE VIEW dbo.V_ACA_PROSPECTO_BECA_RESPUESTA
AS
SELECT
    ISNULL(R.CORR_EMPRESA, PB.CORR_EMPRESA) AS CORR_EMPRESA,
    R.CORR_PROSPECTO_BECA,
    R.CORR_RESPUESTA_BECA,
    S.ORDEN AS ORDEN_SECCION,
    S.NOMBRE_SECCION,
    P.ORDEN AS ORDEN_PREGUNTA,
    P.CORR_PREGUNTA_BECA,
    P.CODIGO_PREGUNTA,
    P.TEXTO_PREGUNTA,
    P.TIPO_RESPUESTA,
    ISNULL(R.CORR_OPCION_BECA, 0) AS CORR_OPCION_BECA,
    CASE
        WHEN P.TIPO_RESPUESTA = 'ACEPTACION'
            THEN COALESCE(NULLIF(LTRIM(RTRIM(R.RESPUESTA_TEXTO)), ''), R.TEXTO_OPCION_HISTORICO)
        WHEN P.TIPO_RESPUESTA IN ('OPCION_UNICA', 'OPCION_MULTIPLE', 'SI_NO')
            THEN R.TEXTO_OPCION_HISTORICO
        WHEN P.TIPO_RESPUESTA IN ('NUMERO', 'DECIMAL') AND R.RESPUESTA_NUMERO IS NOT NULL
            THEN CASE
                    WHEN R.RESPUESTA_NUMERO = FLOOR(R.RESPUESTA_NUMERO)
                        THEN CONVERT(VARCHAR(40), CONVERT(BIGINT, R.RESPUESTA_NUMERO))
                    ELSE CONVERT(VARCHAR(40), CONVERT(DECIMAL(18, 2), R.RESPUESTA_NUMERO))
                 END
        WHEN P.TIPO_RESPUESTA IN ('TEXTO', 'TEXTO_LARGO')
            THEN R.RESPUESTA_TEXTO
        WHEN R.RESPUESTA_FECHA IS NOT NULL
            THEN CONVERT(VARCHAR(10), R.RESPUESTA_FECHA, 103)
        ELSE COALESCE(R.TEXTO_OPCION_HISTORICO, R.RESPUESTA_TEXTO)
    END AS RESPUESTA,
    CAST(ISNULL(R.PUNTAJE_OBTENIDO, 0) AS decimal(10, 2)) AS PUNTAJE_OBTENIDO,
    CAST(ISNULL(R.PORCENTAJE_APLICADO, 0) AS decimal(10, 2)) AS PORCENTAJE_APLICADO
FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA AS R
INNER JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA AS P
    ON P.CORR_PREGUNTA_BECA = R.CORR_PREGUNTA_BECA
INNER JOIN dbo.ACA_PROSPECTO_BECA_SECCION AS S
    ON S.CORR_SECCION_BECA = P.CORR_SECCION_BECA
INNER JOIN dbo.ACA_PROSPECTO_BECA AS PB
    ON PB.CORR_PROSPECTO_BECA = R.CORR_PROSPECTO_BECA
WHERE PB.ESTADO_BECA IN ('BORRADOR', 'ENVIADA')
  AND ISNULL(PB.ACTIVO, 1) = 1
  AND P.TIPO_RESPUESTA <> 'DOCUMENTO';
GO

/* ==========================================================================
   V_ACA_PROSPECTO_BECA_ARCHIVO
   Qué hace: documentos cargados en la solicitud.
   Cómo lo hace: CARPETA es el nombre de carpeta que ya trae ARCHIVO_RUTA
             (año-período y Cif). Si aún no hay ruta, se arma igual.
   ========================================================================== */
IF OBJECT_ID(N'dbo.V_ACA_PROSPECTO_BECA_ARCHIVO', N'V') IS NOT NULL
    DROP VIEW dbo.V_ACA_PROSPECTO_BECA_ARCHIVO;
GO
CREATE VIEW dbo.V_ACA_PROSPECTO_BECA_ARCHIVO
AS
SELECT
    ISNULL(R.CORR_EMPRESA, PB.CORR_EMPRESA) AS CORR_EMPRESA,
    R.CORR_PROSPECTO_BECA,
    R.CORR_RESPUESTA_BECA,
    CAST(PA.ANIO AS smallint) AS ANIO,
    CAST(PA.NUMERO_PERIODO AS tinyint) AS NUMERO_PERIODO,
    CASE
        WHEN NULLIF(LTRIM(RTRIM(R.ARCHIVO_RUTA)), '') IS NOT NULL
             AND CHARINDEX('\', R.ARCHIVO_RUTA) > 0
            THEN RIGHT(
                    LEFT(R.ARCHIVO_RUTA, LEN(R.ARCHIVO_RUTA) - CHARINDEX('\', REVERSE(R.ARCHIVO_RUTA))),
                    CHARINDEX('\', REVERSE(LEFT(R.ARCHIVO_RUTA, LEN(R.ARCHIVO_RUTA) - CHARINDEX('\', REVERSE(R.ARCHIVO_RUTA))))) - 1)
        ELSE CAST(PA.ANIO AS varchar(4)) + '-' + CAST(PA.NUMERO_PERIODO AS varchar(12)) + '_'
            + COALESCE(
                NULLIF(LTRIM(RTRIM(PB.Cif)), ''),
                NULLIF(LTRIM(RTRIM(P.Cif)), ''),
                CAST(PB.CORR_PROSPECTO AS varchar(20)))
    END AS CARPETA,
    S.ORDEN AS ORDEN_SECCION,
    S.NOMBRE_SECCION,
    PR.ORDEN AS ORDEN_PREGUNTA,
    PR.CORR_PREGUNTA_BECA,
    PR.TEXTO_PREGUNTA,
    R.ARCHIVO_NOMBRE,
    R.ARCHIVO_RUTA
FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA AS R
INNER JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA AS PR
    ON PR.CORR_PREGUNTA_BECA = R.CORR_PREGUNTA_BECA
INNER JOIN dbo.ACA_PROSPECTO_BECA_SECCION AS S
    ON S.CORR_SECCION_BECA = PR.CORR_SECCION_BECA
INNER JOIN dbo.ACA_PROSPECTO_BECA AS PB
    ON PB.CORR_PROSPECTO_BECA = R.CORR_PROSPECTO_BECA
INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS AS PA
    ON PA.CORR_PERIODO_ACADEMICO = PB.CORR_PERIODO_ACADEMICO
LEFT JOIN dbo.PersonalInformations AS P
    ON P.InformationId = PB.CORR_PROSPECTO
WHERE PB.ESTADO_BECA IN ('BORRADOR', 'ENVIADA')
  AND ISNULL(PB.ACTIVO, 1) = 1
  AND PR.TIPO_RESPUESTA = 'DOCUMENTO'
  AND NULLIF(LTRIM(RTRIM(ISNULL(R.ARCHIVO_NOMBRE, R.ARCHIVO_RUTA))), '') IS NOT NULL;
GO
