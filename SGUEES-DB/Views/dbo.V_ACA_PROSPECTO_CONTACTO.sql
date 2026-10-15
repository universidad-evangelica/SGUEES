-- Qué hace: script de documentación de la vista V_ACA_PROSPECTO_CONTACTO (ya existente en BD).
-- Cómo lo hace: definición leída desde SQL Server, sin cambiar columnas ni filtros.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/* --------------------------------------------------------------------------
   BLOQUE 2.2 — V_ACA_PROSPECTO_CONTACTO
   Qué hace: correos y teléfonos del prospecto.
   Cómo lo hace: cada fila de ACA_PROSPECTO_CONTACTO es un dato; se traduce
             el tipo a texto a partir de ES_CORREO / ES_TELEFONO.
   -------------------------------------------------------------------------- */
CREATE   VIEW dbo.V_ACA_PROSPECTO_CONTACTO
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
