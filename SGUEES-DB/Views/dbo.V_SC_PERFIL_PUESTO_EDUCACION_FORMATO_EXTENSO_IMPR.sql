SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_PERFIL_PUESTO_EDUCACION_FORMATO_EXTENSO_IMPR
-- Qué hace: educación del perfil de puesto para impresión Formato extenso (detalle).
-- Cómo: 1 fila por SC_PERFIL_PUESTO_EDUCACION; sin auditoría.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO (result set 12).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_PERFIL_PUESTO_EDUCACION_FORMATO_EXTENSO_IMPR]
AS
SELECT
  E.[CORR_EMPRESA],
  E.[CORR_DESCRIPTOR_PUESTO],
  E.[CORR_PERFIL_PUESTO],
  E.[CORR_EDUCACION],
  E.[REQUISITO],
  E.[ESPECIFICACIONES],
  E.[TIPO_REQUERIDO]
FROM [dbo].[SC_PERFIL_PUESTO_EDUCACION] E
GO
