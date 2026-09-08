SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_PERFIL_PUESTO_EXPERIENCIA_FORMATO_EXTENSO_IMPR
-- Qué hace: experiencia del perfil de puesto para impresión Formato extenso (detalle).
-- Cómo: 1 fila por SC_PERFIL_PUESTO_EXPERIENCIA; sin auditoría.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO (result set 13).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_PERFIL_PUESTO_EXPERIENCIA_FORMATO_EXTENSO_IMPR]
AS
SELECT
  E.[CORR_EMPRESA],
  E.[CORR_DESCRIPTOR_PUESTO],
  E.[CORR_PERFIL_PUESTO],
  E.[CORR_EXPERIENCIA],
  E.[REQUISITO],
  E.[TIPO_REQUERIDO]
FROM [dbo].[SC_PERFIL_PUESTO_EXPERIENCIA] E
GO
