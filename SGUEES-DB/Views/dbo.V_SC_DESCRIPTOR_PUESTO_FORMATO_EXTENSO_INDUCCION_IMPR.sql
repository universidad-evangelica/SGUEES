SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_INDUCCION_IMPR
-- Qué hace: inducciones/entrenamiento del descriptor para impresión Formato extenso.
-- Cómo: 1 fila por SC_DESCRIPTOR_PUESTO_INDUCCION; sin auditoría.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO (result set 10).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_INDUCCION_IMPR]
AS
SELECT
  I.[CORR_EMPRESA],
  I.[CORR_DESCRIPTOR_PUESTO],
  I.[CORR_INDUCCION],
  I.[NOMBRE_INDUCCION],
  I.[TIEMPO_INDUCCION]
FROM [dbo].[SC_DESCRIPTOR_PUESTO_INDUCCION] I
GO
