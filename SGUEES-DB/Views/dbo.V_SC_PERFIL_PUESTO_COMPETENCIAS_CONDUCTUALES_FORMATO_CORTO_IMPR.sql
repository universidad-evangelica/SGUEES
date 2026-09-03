SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES_FORMATO_CORTO_IMPR
-- Qué hace: competencias conductuales del perfil para impresión Formato corto (detalle).
-- Cómo: 1 fila por SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES; sin campos de auditoría.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO (result set 11).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES_FORMATO_CORTO_IMPR]
AS
SELECT
  CC.[CORR_EMPRESA],
  CC.[CORR_DESCRIPTOR_PUESTO],
  CC.[CORR_PERFIL_PUESTO],
  CC.[CORR_COMPETENCIAS_CONDUCTUALES],
  CC.[CODIGO_TIPO_PUESTO],
  CC.[NOMBRE_COMPETENCIAS_CONDUCTUALES],
  CC.[DESCRIPCION]
FROM [dbo].[SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES] CC
GO
