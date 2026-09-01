SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_RESPONSABILIDAD_CARGO_IMPR
-- Qué hace: responsabilidades del cargo para Formato corto (subinforme Crystal).
-- Cómo: 1 fila por SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO; el SP filtra por
--       CORR_DESCRIPTOR_PUESTO y APLICA_DESCRIPTOR (CORTO o AMBOS).
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO (result set 5).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_RESPONSABILIDAD_CARGO_IMPR]
AS
SELECT
  D.[CORR_EMPRESA],
  D.[CORR_DESCRIPTOR_PUESTO],
  D.[CORR_RESPONSABILIDAD],
  D.[NOMBRE_RESPONSABILIDAD],
  D.[INFORMACION],
  D.[APLICA_DESCRIPTOR]
FROM [dbo].[SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO] D
GO
