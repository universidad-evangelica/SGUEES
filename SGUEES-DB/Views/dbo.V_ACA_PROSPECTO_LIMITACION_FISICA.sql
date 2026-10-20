-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_LIMITACION_FISICA (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/* --------------------------------------------------------------------------
   BLOQUE 2.4 — V_ACA_PROSPECTO_LIMITACION_FISICA
   Qué hace: limitaciones físicas declaradas (sección Salud).
   Cómo lo hace: une ACA_PROSPECTO_LIMITACION_FISICA con su catálogo.
   -------------------------------------------------------------------------- */
CREATE   VIEW dbo.V_ACA_PROSPECTO_LIMITACION_FISICA
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
