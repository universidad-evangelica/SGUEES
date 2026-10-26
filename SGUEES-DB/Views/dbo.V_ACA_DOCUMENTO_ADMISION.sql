-- Qué hace: lectura del catálogo de documentos de admisión.
-- Cómo lo hace: proyecta ACA_DOCUMENTO_ADMISION para el mantenimiento.
-- El usuario ejecuta este script en SGUEES. No modifica la tabla.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER VIEW [dbo].[V_ACA_DOCUMENTO_ADMISION]
AS
SELECT
    CORR_DOCUMENTO_ADMISION,
    NOMBRE_DOCUMENTO,
    CODIGO,
    OBLIGATORIO,
    ORDEN,
    ACTIVO,
    USUARIO_CREA,
    ESTACION_CREA,
    FECHA_CREA,
    USUARIO_ACTU,
    ESTACION_ACTU,
    FECHA_ACTU,
    FORMATOS_PERMITIDOS,
    TAMANO_MAXIMO_MB
FROM dbo.ACA_DOCUMENTO_ADMISION;
GO
