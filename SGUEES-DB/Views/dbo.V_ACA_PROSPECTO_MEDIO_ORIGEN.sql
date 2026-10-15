-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_MEDIO_ORIGEN (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/* --------------------------------------------------------------------------
   BLOQUE 2.6 — V_ACA_PROSPECTO_MEDIO_ORIGEN
   Qué hace: medios por los que el prospecto conoció la universidad
             (sección Información adicional).
   Cómo lo hace: une ACA_PROSPECTO_MEDIO_ORIGEN con GEN_MEDIO_ORIGEN y, si
             lo refirió un estudiante, con la carrera de ese estudiante.
   -------------------------------------------------------------------------- */
CREATE   VIEW dbo.V_ACA_PROSPECTO_MEDIO_ORIGEN
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
