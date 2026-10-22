-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_EMPLEO (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
CREATE   VIEW dbo.V_ACA_PROSPECTO_EMPLEO
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
