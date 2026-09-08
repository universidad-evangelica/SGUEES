SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RELACION_LABORAL_INTERNAS_IMPR
-- Qué hace: relaciones laborales INTERNAS para impresión Formato extenso (detalle).
-- Cómo: 1 fila por SC_DESCRIPTOR_PUESTO_RELACION_LABORAL con TIPO_RELACION = 'I';
--       sin auditoría. Misma tabla que la vista de externas.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO (result set 6).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RELACION_LABORAL_INTERNAS_IMPR]
AS
SELECT
  R.[CORR_EMPRESA],
  R.[CORR_DESCRIPTOR_PUESTO],
  R.[CORR_RELACION_LABORAL],
  RTRIM(R.[TIPO_RELACION]) AS [TIPO_RELACION],
  R.[PUESTO_AREA],
  R.[MOTIVO_RELACION]
FROM [dbo].[SC_DESCRIPTOR_PUESTO_RELACION_LABORAL] R
WHERE RTRIM(R.[TIPO_RELACION]) = N'I'
GO
