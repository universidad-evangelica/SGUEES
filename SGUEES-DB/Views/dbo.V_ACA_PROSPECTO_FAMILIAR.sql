-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_FAMILIAR (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* ==========================================================================
   V_ACA_PROSPECTO_FAMILIAR — agrega NOMBRES, APELLIDO1 y APELLIDO2
   ==========================================================================
   Qué hace: expone en la vista los tres campos del nombre por separado, además
             del NOMBRE_COMPLETO que ya devolvía.
   Por qué:  la vista solo entregaba NOMBRE_COMPLETO (calculado). Servía para la
             consulta, pero al editar un familiar en el ERP el formulario no
             podía cargar nombres ni apellidos: llegaban vacíos y al guardar se
             habrían perdido. La vista es la única fuente de lectura del
             mantenimiento, así que debe traer todo lo editable.
   Impacto:  solo agrega columnas al final; nada que consuma la vista hoy se ve
             afectado (SELECT por nombre de columna en el API y el SPA).
   Reversa:  volver a ejecutar el BLOQUE 2.3 de SGUEES-DB\Scripts\ACA_PROSPECTO.sql.
   ========================================================================== */

CREATE   VIEW dbo.V_ACA_PROSPECTO_FAMILIAR
AS
SELECT
    VP.CORR_EMPRESA,
    VP.CORR_PROSPECTO,
    F.CORR_PROSPECTO_PERSONA,
    F.CORR_PROSPECTO_FAMILIAR,
    F.CORR_PARENTESCO,
    G.NOMBRE_PARENTESCO,
    F.NOMBRES,
    F.APELLIDO1,
    F.APELLIDO2,
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
