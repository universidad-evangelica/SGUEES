SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_INDUCCION_IMPR
-- Qué hace: inducciones asignadas al descriptor para impresión Formato corto (detalle).
-- Cómo: 1 fila por SC_DESCRIPTOR_PUESTO_INDUCCION; sin filas si no hay inducciones.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO (result set 6).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_INDUCCION_IMPR]
AS
SELECT
  I.[CORR_EMPRESA],
  I.[CORR_DESCRIPTOR_PUESTO],
  I.[CORR_INDUCCION],
  I.[NOMBRE_INDUCCION],
  I.[TIEMPO_INDUCCION]
FROM [dbo].[SC_DESCRIPTOR_PUESTO_INDUCCION] I
GO
