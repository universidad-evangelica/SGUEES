/*
  ACA_PROSPECTO — consulta de prospectos de pregrado (idempotente)
  Pantalla: Académico → Consultas → Prospectos (/aca-prospecto)

  Ejecutar (completo, se puede repetir sin duplicar nada):
    sqlcmd -S <srv> -d SGUEES -U <user> -P <pass> -f 65001 -i SGUEES-DB/Scripts/ACA_PROSPECTO.sql

  Bloques:
    1. Base      → UNIQUE prospecto ↔ persona, V_ACA_PROSPECTO_CICLO, V_ACA_PROSPECTO
    2. Personal  → V_ACA_PROSPECTO_PERSONA, _CONTACTO, _FAMILIAR,
                   _LIMITACION_FISICA, _DEPORTACION, _MEDIO_ORIGEN
    3. Académica → V_ACA_PROSPECTO_ESTUDIO (la carrera a la que aplica sale de V_ACA_PROSPECTO)
    4. Económica → V_ACA_PROSPECTO_EMPLEO, V_ACA_PROSPECTO_SE_RESPUESTA,
                   V_ACA_PROSPECTO_SOCIOECONOMICO

  Reglas comunes de las vistas:
    - Solo pregrado (CORR_AREA_ACADEMICA = 5), filtrado dentro de la vista.
    - Todas exponen CORR_EMPRESA (del área académica) porque la API filtra por la empresa del JWT.
    - Nunca exponen CONTRASENA_PROSPECTO ni GUID_REGISTRO.
    - Sintaxis compatible con el nivel de compatibilidad 100 de SGUEES.
    - Se crean con QUOTED_IDENTIFIER y ANSI_NULLS en ON (lo exige FOR XML
      .value() del bloque 4; sqlcmd los trae apagados por defecto).
*/
USE SGUEES;
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

/* ==========================================================================
   BLOQUE 1.1 — UNIQUE 1:1 prospecto ↔ persona
   Qué hace: garantiza que cada prospecto tenga una sola persona en
             ACA_PROSPECTO_PERSONA (hoy la BD no lo impide).
   Cómo lo hace: si ya hay duplicados se detiene con un mensaje y no crea
             nada; si no existe la restricción, la agrega; si ya existe, no
             hace nada.
   ========================================================================== */
IF EXISTS (
    SELECT 1
    FROM dbo.ACA_PROSPECTO_PERSONA
    GROUP BY CORR_PROSPECTO
    HAVING COUNT(*) > 1
)
BEGIN
    RAISERROR(N'ACA_PROSPECTO_PERSONA tiene prospectos con más de una persona. Corrija los duplicados antes de crear UQ_ACA_PROSPECTO_PERSONA_PROSPECTO.', 16, 1);
END
ELSE IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ACA_PROSPECTO_PERSONA')
      AND name = N'UQ_ACA_PROSPECTO_PERSONA_PROSPECTO'
)
BEGIN
    ALTER TABLE dbo.ACA_PROSPECTO_PERSONA
        ADD CONSTRAINT UQ_ACA_PROSPECTO_PERSONA_PROSPECTO UNIQUE (CORR_PROSPECTO);

    PRINT N'UQ_ACA_PROSPECTO_PERSONA_PROSPECTO creado.';
END
ELSE
BEGIN
    PRINT N'UQ_ACA_PROSPECTO_PERSONA_PROSPECTO ya existía; sin cambios.';
END
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
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO_CICLO
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

/* ==========================================================================
   BLOQUE 1.3 — V_ACA_PROSPECTO (listado por ciclo + encabezado)
   Qué hace: una fila por prospecto de pregrado con los datos del listado
             (CIF, nombre, DUI, carrera, modalidad, forma de ingreso, estado,
             fecha de registro) y lo que usa el encabezado de la vista.
   Cómo lo hace: parte de ACA_PROSPECTO y trae ciclo (período), carrera,
             modalidad y facultad (plan académico) y la persona. Traduce los
             códigos FORMA_INGRESO y ESTADO a texto. Recorta espacios de
             nombres y apellidos porque algunos vienen con espacios al final.
   ========================================================================== */
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO
AS
SELECT
    AA.CORR_EMPRESA,
    P.CORR_PROSPECTO,
    P.CODIGO_PROSPECTO,
    P.ACTIVO_PROSPECTO,
    PE.CORR_PROSPECTO_PERSONA,
    LTRIM(RTRIM(PE.NOMBRES))   AS NOMBRES,
    LTRIM(RTRIM(PE.APELLIDO1)) AS APELLIDO1,
    LTRIM(RTRIM(PE.APELLIDO2)) AS APELLIDO2,
    LTRIM(RTRIM(PE.NOMBRES))
        + ' ' + LTRIM(RTRIM(PE.APELLIDO1))
        + ISNULL(' ' + NULLIF(LTRIM(RTRIM(PE.APELLIDO2)), ''), '') AS NOMBRE_COMPLETO,
    PE.DUI,
    P.CORR_PERIODO_ACADEMICO,
    PA.ANIO,
    PA.NUMERO_PERIODO,
    CAST(PA.ANIO AS VARCHAR(4)) + '-' + RIGHT('0' + CAST(PA.NUMERO_PERIODO AS VARCHAR(2)), 2) AS CICLO,
    P.CORR_PLAN_ACADEMICO,
    PL.CODIGO_PLAN,
    CA.CORR_CARRERA,
    CA.CODIGO_CARRERA,
    CA.NOMBRE_CARRERA,
    MO.CORR_MODALIDAD,
    MO.NOMBRE_MODALIDAD,
    FA.CORR_FACULTAD,
    RTRIM(FA.NOMBRE_FACULTAD) AS NOMBRE_FACULTAD,
    P.FORMA_INGRESO,
    CASE P.FORMA_INGRESO
        WHEN 'NI' THEN 'Nuevo Ingreso'
        WHEN 'EQ' THEN 'Ingreso por Equivalencia'
        WHEN 'CC' THEN 'Cambio de Carrera'
        WHEN 'RI' THEN 'Reingreso'
        ELSE P.FORMA_INGRESO
    END AS FORMA_INGRESO_TEXTO,
    P.ESTADO,
    CASE P.ESTADO
        WHEN 'P' THEN 'Pendiente'
        WHEN 'C' THEN 'Completado'
        ELSE P.ESTADO
    END AS ESTADO_TEXTO,
    P.FINANCIA_ESTUDIOS,
    P.FECHA_CREA AS FECHA_REGISTRO
FROM dbo.ACA_PROSPECTO AS P
INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS AS PA
    ON PA.CORR_PERIODO_ACADEMICO = P.CORR_PERIODO_ACADEMICO
INNER JOIN dbo.ACA_AREAS_ACADEMICAS AS AA
    ON AA.CORR_AREA_ACADEMICA = PA.CORR_AREA_ACADEMICA
INNER JOIN dbo.ACA_PLANES_ACADEMICOS AS PL
    ON PL.CORR_PLAN_ACADEMICO = P.CORR_PLAN_ACADEMICO
LEFT JOIN dbo.ACA_CARRERAS AS CA
    ON CA.CORR_CARRERA = PL.CORR_CARRERA
LEFT JOIN dbo.ACA_MODALIDADES_ACADEMICAS AS MO
    ON MO.CORR_MODALIDAD = PL.CORR_MODALIDAD
LEFT JOIN dbo.ACA_FACULTADES AS FA
    ON FA.CORR_FACULTAD = CA.CORR_FACULTAD
LEFT JOIN dbo.ACA_PROSPECTO_PERSONA AS PE
    ON PE.CORR_PROSPECTO = P.CORR_PROSPECTO
WHERE PA.CORR_AREA_ACADEMICA = 5;
GO

PRINT N'ACA_PROSPECTO bloque 1 listo: UQ persona, V_ACA_PROSPECTO_CICLO, V_ACA_PROSPECTO.';
GO

/* ==========================================================================
   BLOQUE 2 — Pestaña "Información personal"
   Regla común: cada vista se une a V_ACA_PROSPECTO para heredar CORR_EMPRESA
   y el filtro de pregrado, y expone CORR_PROSPECTO para filtrar desde la API.
   Los catálogos van con LEFT JOIN porque varias columnas no tienen FK.
   ========================================================================== */

/* --------------------------------------------------------------------------
   BLOQUE 2.1 — V_ACA_PROSPECTO_PERSONA
   Qué hace: datos personales del prospecto con los nombres de sus catálogos.
   Cómo lo hace: toma ACA_PROSPECTO_PERSONA y resuelve sexo, estado civil,
             tipo de sangre, nacionalidad, países, depto, municipio y
             religión. Depto y municipio se unen por su llave compuesta
             (país + depto [+ municipio]). La edad se calcula a la fecha.
   -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO_PERSONA
AS
SELECT
    VP.CORR_EMPRESA,
    VP.CORR_PROSPECTO,
    PE.CORR_PROSPECTO_PERSONA,
    VP.NOMBRES,
    VP.APELLIDO1,
    VP.APELLIDO2,
    VP.NOMBRE_COMPLETO,
    PE.DUI,
    PE.NIE,
    PE.CARNET_RESIDENCIA,
    PE.NIT,
    PE.FECHA_NACIMIENTO,
    CASE
        WHEN PE.FECHA_NACIMIENTO IS NULL THEN NULL
        ELSE DATEDIFF(YEAR, PE.FECHA_NACIMIENTO, GETDATE())
             - CASE
                   WHEN DATEADD(YEAR, DATEDIFF(YEAR, PE.FECHA_NACIMIENTO, GETDATE()), PE.FECHA_NACIMIENTO) > CAST(GETDATE() AS DATE) THEN 1
                   ELSE 0
               END
    END AS EDAD,
    PE.LUGAR_NACIMIENTO,
    PE.CORR_SEXO,
    SX.NOMBRE AS SEXO,
    PE.CORR_ESTADO_CIVIL,
    EC.NOMBRE AS ESTADO_CIVIL,
    PE.CORR_TIPO_SANGRE,
    TS.NOMBRE AS TIPO_SANGRE,
    PE.GEN_PAIS_NACIONALIDAD AS CORR_PAIS_NACIONALIDAD,
    COALESCE(NULLIF(LTRIM(RTRIM(PN.NACIONALIDAD)), ''), PN.NOMBRE_PAIS) AS NACIONALIDAD,
    PE.CORR_PAIS_PROCEDENCIA,
    COALESCE(PP.NOMBRE_PAIS, PE.PAIS_PROCEDENCIA) AS PAIS_PROCEDENCIA,
    PE.CORR_PAIS_RESIDENCIA,
    PR.NOMBRE_PAIS AS PAIS_RESIDENCIA,
    PE.CORR_DEPTO_RESIDENCIA,
    DP.NOMBRE_DEPTO AS DEPTO_RESIDENCIA,
    PE.CORR_MUNICIPIO_RESIDENCIA,
    MU.NOMBRE_MUNICIPIO AS MUNICIPIO_RESIDENCIA,
    PE.DIRECCION_ACTUAL,
    PE.CORR_RELIGION,
    RE.NOMBRE_RELIGION AS RELIGION,
    PE.IGLESIA_ACTUAL,
    PE.TRABAJA,
    PE.HA_SIDO_DEPORTADO,
    PE.POSEE_DISCAPACIDAD
FROM dbo.V_ACA_PROSPECTO AS VP
INNER JOIN dbo.ACA_PROSPECTO_PERSONA AS PE
    ON PE.CORR_PROSPECTO = VP.CORR_PROSPECTO
LEFT JOIN dbo.GEN_SEXO AS SX
    ON SX.CORR_SEXO = PE.CORR_SEXO
LEFT JOIN dbo.GEN_ESTADO_CIVIL AS EC
    ON EC.CORR_ESTADO_CIVIL = PE.CORR_ESTADO_CIVIL
LEFT JOIN dbo.GEN_TIPO_SANGRE AS TS
    ON TS.CORR_TIPO_SANGRE = PE.CORR_TIPO_SANGRE
LEFT JOIN dbo.GEN_PAIS AS PN
    ON PN.CORR_PAIS = PE.GEN_PAIS_NACIONALIDAD
LEFT JOIN dbo.GEN_PAIS AS PP
    ON PP.CORR_PAIS = PE.CORR_PAIS_PROCEDENCIA
LEFT JOIN dbo.GEN_PAIS AS PR
    ON PR.CORR_PAIS = PE.CORR_PAIS_RESIDENCIA
LEFT JOIN dbo.GEN_DEPTO AS DP
    ON DP.CORR_PAIS = PE.CORR_PAIS_RESIDENCIA
   AND DP.CORR_DEPTO = PE.CORR_DEPTO_RESIDENCIA
LEFT JOIN dbo.GEN_MUNICIPIO AS MU
    ON MU.CORR_PAIS = PE.CORR_PAIS_RESIDENCIA
   AND MU.CORR_DEPTO = PE.CORR_DEPTO_RESIDENCIA
   AND MU.CORR_MUNICIPIO = PE.CORR_MUNICIPIO_RESIDENCIA
LEFT JOIN dbo.GEN_RELIGION AS RE
    ON RE.CORR_RELIGION = PE.CORR_RELIGION;
GO

/* --------------------------------------------------------------------------
   BLOQUE 2.2 — V_ACA_PROSPECTO_CONTACTO
   Qué hace: correos y teléfonos del prospecto.
   Cómo lo hace: cada fila de ACA_PROSPECTO_CONTACTO es un dato; se traduce
             el tipo a texto a partir de ES_CORREO / ES_TELEFONO.
   -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO_CONTACTO
AS
SELECT
    VP.CORR_EMPRESA,
    VP.CORR_PROSPECTO,
    C.CORR_PROSPECTO_PERSONA,
    C.CORR_PROSPECTO_CONTACTO,
    C.CONTACTO,
    CASE
        WHEN C.ES_CORREO = 1 THEN N'Correo'
        WHEN C.ES_TELEFONO = 1 THEN N'Teléfono'
        ELSE N'Otro'
    END AS TIPO_CONTACTO,
    C.ES_CORREO,
    C.ES_TELEFONO,
    C.ES_PRINCIPAL,
    C.ES_TRABAJO
FROM dbo.V_ACA_PROSPECTO AS VP
INNER JOIN dbo.ACA_PROSPECTO_CONTACTO AS C
    ON C.CORR_PROSPECTO_PERSONA = VP.CORR_PROSPECTO_PERSONA;
GO

/* --------------------------------------------------------------------------
   BLOQUE 2.3 — V_ACA_PROSPECTO_FAMILIAR
   Qué hace: familiares y contacto de emergencia, con los indicadores que la
             pantalla usa para repartirlos entre "Familia" y "Contacto de
             emergencia".
   Cómo lo hace: replica la regla de admisiones (PersonalInformationsController):
             - ES_NUCLEO = 1 para PADRE (1), MADRE (2) y CÓNYUGE (3), los
               únicos que llena el formulario de datos familiares.
             - Si la emergencia es del núcleo, admisiones marca esa misma fila.
             - Si no, crea una fila aparte solo con nombre, teléfono y
               dirección de emergencia → ES_SOLO_EMERGENCIA = 1.
             También es "solo emergencia" una fila del núcleo marcada como
             emergencia que no trae ningún dato familiar (caso: se puso a la
             madre como emergencia sin llenarla en datos familiares).
   -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO_FAMILIAR
AS
SELECT
    VP.CORR_EMPRESA,
    VP.CORR_PROSPECTO,
    F.CORR_PROSPECTO_PERSONA,
    F.CORR_PROSPECTO_FAMILIAR,
    F.CORR_PARENTESCO,
    G.NOMBRE_PARENTESCO,
    LTRIM(RTRIM(ISNULL(F.NOMBRES, '')
        + ISNULL(' ' + NULLIF(LTRIM(RTRIM(F.APELLIDO1)), ''), '')
        + ISNULL(' ' + NULLIF(LTRIM(RTRIM(F.APELLIDO2)), ''), ''))) AS NOMBRE_COMPLETO,
    F.TRABAJA,
    F.PROFESION,
    F.OCUPACION,
    F.NOMBRE_EMPRESA,
    F.TELEFONO_TRABAJO,
    F.DIRECCION_TRABAJO,
    F.DIRECCION_CASA,
    F.TELEFONO,
    F.TELEFONO2,
    F.VIVE_CON_EL,
    F.FINANCIA_ESTUDIOS,
    F.ACTIVO,
    CAST(ISNULL(F.ES_EMERGENCIA, 0) AS BIT) AS ES_EMERGENCIA,
    F.DIRECCION_EMERGENCIA,
    F.TELEFONO_EMERGENCIA,
    CAST(CASE WHEN F.CORR_PARENTESCO IN (1, 2, 3) THEN 1 ELSE 0 END AS BIT) AS ES_NUCLEO,
    CAST(CASE
            WHEN ISNULL(F.ES_EMERGENCIA, 0) = 1
             AND (F.CORR_PARENTESCO NOT IN (1, 2, 3)
                  OR (F.DIRECCION_CASA IS NULL
                      AND F.TELEFONO IS NULL
                      AND F.PROFESION IS NULL
                      AND F.NOMBRE_EMPRESA IS NULL
                      AND F.TELEFONO_TRABAJO IS NULL))
            THEN 1
            ELSE 0
         END AS BIT) AS ES_SOLO_EMERGENCIA
FROM dbo.V_ACA_PROSPECTO AS VP
INNER JOIN dbo.ACA_PROSPECTO_FAMILIAR AS F
    ON F.CORR_PROSPECTO_PERSONA = VP.CORR_PROSPECTO_PERSONA
LEFT JOIN dbo.GEN_PARENTESCO AS G
    ON G.CORR_PARENTESCO = F.CORR_PARENTESCO;
GO

/* --------------------------------------------------------------------------
   BLOQUE 2.4 — V_ACA_PROSPECTO_LIMITACION_FISICA
   Qué hace: limitaciones físicas declaradas (sección Salud).
   Cómo lo hace: une ACA_PROSPECTO_LIMITACION_FISICA con su catálogo.
   -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO_LIMITACION_FISICA
AS
SELECT
    VP.CORR_EMPRESA,
    VP.CORR_PROSPECTO,
    L.CORR_PROSPECTO_PERSONA,
    L.CORR_PROSPECTO_LIMITACION_FISICA,
    L.CORR_LIMITACION_FISICA,
    G.NOMBRE AS NOMBRE_LIMITACION,
    L.ESPECIFIQUE
FROM dbo.V_ACA_PROSPECTO AS VP
INNER JOIN dbo.ACA_PROSPECTO_LIMITACION_FISICA AS L
    ON L.CORR_PROSPECTO_PERSONA = VP.CORR_PROSPECTO_PERSONA
LEFT JOIN dbo.GEN_LIMITACIONES_FISICA AS G
    ON G.CORR_LIMITACION_FISICA = L.CORR_LIMITACION_FISICA;
GO

/* --------------------------------------------------------------------------
   BLOQUE 2.5 — V_ACA_PROSPECTO_DEPORTACION
   Qué hace: deportaciones declaradas (sección migratoria).
   Cómo lo hace: une ACA_PROSPECTO_DEPORTACION con GEN_PAIS.
   -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO_DEPORTACION
AS
SELECT
    VP.CORR_EMPRESA,
    VP.CORR_PROSPECTO,
    D.CORR_PROSPECTO_PERSONA,
    D.CORR_PROSPECTO_DEPORTACION,
    D.CORR_PAIS,
    PA.NOMBRE_PAIS,
    D.ES_VIGENTE,
    D.OBSERVACION
FROM dbo.V_ACA_PROSPECTO AS VP
INNER JOIN dbo.ACA_PROSPECTO_DEPORTACION AS D
    ON D.CORR_PROSPECTO_PERSONA = VP.CORR_PROSPECTO_PERSONA
LEFT JOIN dbo.GEN_PAIS AS PA
    ON PA.CORR_PAIS = D.CORR_PAIS;
GO

/* --------------------------------------------------------------------------
   BLOQUE 2.6 — V_ACA_PROSPECTO_MEDIO_ORIGEN
   Qué hace: medios por los que el prospecto conoció la universidad
             (sección Información adicional).
   Cómo lo hace: une ACA_PROSPECTO_MEDIO_ORIGEN con GEN_MEDIO_ORIGEN y, si
             lo refirió un estudiante, con la carrera de ese estudiante.
   -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO_MEDIO_ORIGEN
AS
SELECT
    VP.CORR_EMPRESA,
    VP.CORR_PROSPECTO,
    M.CORR_PROSPECTO_PERSONA,
    M.CORR_PROSPECTO_MEDIO,
    M.CORR_MEDIO_ORIGEN,
    G.NOMBRE AS NOMBRE_MEDIO,
    G.ORDEN AS ORDEN_MEDIO,
    M.DESCRIPCION,
    M.ESTUDIANTE_REFIERE,
    M.CORR_CARRERA_REFIERE,
    CA.NOMBRE_CARRERA AS CARRERA_REFIERE
FROM dbo.V_ACA_PROSPECTO AS VP
INNER JOIN dbo.ACA_PROSPECTO_MEDIO_ORIGEN AS M
    ON M.CORR_PROSPECTO_PERSONA = VP.CORR_PROSPECTO_PERSONA
LEFT JOIN dbo.GEN_MEDIO_ORIGEN AS G
    ON G.CORR_MEDIO_ORIGEN = M.CORR_MEDIO_ORIGEN
LEFT JOIN dbo.ACA_CARRERAS AS CA
    ON CA.CORR_CARRERA = M.CORR_CARRERA_REFIERE;
GO

PRINT N'ACA_PROSPECTO bloque 2 listo: PERSONA, CONTACTO, FAMILIAR, LIMITACION_FISICA, DEPORTACION, MEDIO_ORIGEN.';
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
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO_ESTUDIO
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

PRINT N'ACA_PROSPECTO bloque 3 listo: ESTUDIO.';
GO

/* ==========================================================================
   BLOQUE 4 — Pestaña "Información económica"
   ========================================================================== */

/* --------------------------------------------------------------------------
   BLOQUE 4.1 — V_ACA_PROSPECTO_EMPLEO
   Qué hace: información laboral del prospecto (formulario personal).
   Cómo lo hace: admisiones no guarda el país del empleo; solo guarda depto y
             municipio cuando el empleo es en el país (TIENE_EMPLEO_FUERA = 0).
             Como CORR_DEPTO es único en GEN_DEPTO, el depto se busca por su
             código y el país se toma del depto. El municipio se busca siempre
             junto con su depto porque CORR_MUNICIPIO se repite entre deptos.
             SALARIO_MENSUAL y APORTE_LIQUIDO hoy vienen vacíos: el ingreso
             del estudiante se captura en el estudio socioeconómico.
   -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO_EMPLEO
AS
SELECT
    VP.CORR_EMPRESA,
    VP.CORR_PROSPECTO,
    E.CORR_PROSPECTO_PERSONA,
    E.CORR_PROSPECTO_EMPLEO,
    E.EMPRESA,
    E.CARGO,
    E.DIRECCION,
    E.TELEFONO,
    E.EMAIL,
    E.CORR_SECTOR_LABORAL,
    SL.NOMBRE AS SECTOR_LABORAL,
    COALESCE(E.CORR_PAIS, DP.CORR_PAIS) AS CORR_PAIS,
    PA.NOMBRE_PAIS,
    E.CORR_DEPTO,
    DP.NOMBRE_DEPTO,
    E.CORR_MUNICIPIO,
    MU.NOMBRE_MUNICIPIO,
    E.TRABAJA_AUN,
    E.TIENE_EMPLEO_FUERA,
    E.SALARIO_MENSUAL,
    E.APORTE_LIQUIDO
FROM dbo.V_ACA_PROSPECTO AS VP
INNER JOIN dbo.ACA_PROSPECTO_EMPLEO AS E
    ON E.CORR_PROSPECTO_PERSONA = VP.CORR_PROSPECTO_PERSONA
LEFT JOIN dbo.GEN_SECTOR_LABORAL AS SL
    ON SL.CORR_SECTOR_LABORAL = E.CORR_SECTOR_LABORAL
LEFT JOIN dbo.GEN_DEPTO AS DP
    ON DP.CORR_DEPTO = E.CORR_DEPTO
   AND (E.CORR_PAIS IS NULL OR DP.CORR_PAIS = E.CORR_PAIS)
LEFT JOIN dbo.GEN_PAIS AS PA
    ON PA.CORR_PAIS = COALESCE(E.CORR_PAIS, DP.CORR_PAIS)
LEFT JOIN dbo.GEN_MUNICIPIO AS MU
    ON MU.CORR_PAIS = DP.CORR_PAIS
   AND MU.CORR_DEPTO = DP.CORR_DEPTO
   AND MU.CORR_MUNICIPIO = E.CORR_MUNICIPIO;
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
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO_SE_RESPUESTA
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
CREATE OR ALTER VIEW dbo.V_ACA_PROSPECTO_SOCIOECONOMICO
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

PRINT N'ACA_PROSPECTO bloque 4 listo: EMPLEO, SE_RESPUESTA, SOCIOECONOMICO.';
GO
