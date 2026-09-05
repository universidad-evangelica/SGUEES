SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_REQUERIMIENTO_ORGANIZACIONAL_IMPR
-- Qué hace: requerimientos organizacionales del descriptor para impresión Formato extenso.
-- Cómo: 1 fila por SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONAL; sin auditoría.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO (result set 8).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_REQUERIMIENTO_ORGANIZACIONAL_IMPR]
AS
SELECT
  D.[CORR_EMPRESA],
  D.[CORR_DESCRIPTOR_PUESTO],
  D.[CORR_REQUERIMIENTO_ORGANIZACIONAL],
  D.[DESCRIPCION]
FROM [dbo].[SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONAL] D
GO
