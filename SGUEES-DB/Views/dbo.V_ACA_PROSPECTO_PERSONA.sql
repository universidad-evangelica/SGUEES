-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_PERSONA (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
CREATE   VIEW dbo.V_ACA_PROSPECTO_PERSONA
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
