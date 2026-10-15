-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_DEPORTACION (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/* --------------------------------------------------------------------------
   BLOQUE 2.5 — V_ACA_PROSPECTO_DEPORTACION
   Qué hace: deportaciones declaradas (sección migratoria).
   Cómo lo hace: une ACA_PROSPECTO_DEPORTACION con GEN_PAIS.
   -------------------------------------------------------------------------- */
CREATE   VIEW dbo.V_ACA_PROSPECTO_DEPORTACION
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
