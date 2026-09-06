SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RIESGO_PUESTO_IMPR
-- Qué hace: riesgos físicos del puesto del descriptor para impresión Formato extenso.
-- Cómo: 1 fila por SC_DESCRIPTOR_PUESTO_RIESGO_PUESTO; sin auditoría.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO (result set 9).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RIESGO_PUESTO_IMPR]
AS
SELECT
  D.[CORR_EMPRESA],
  D.[CORR_DESCRIPTOR_PUESTO],
  D.[CORR_RIESGO_PUESTO],
  D.[NOMBRE_RIESGO_PUESTO],
  D.[INFORMACION]
FROM [dbo].[SC_DESCRIPTOR_PUESTO_RIESGO_PUESTO] D
GO
