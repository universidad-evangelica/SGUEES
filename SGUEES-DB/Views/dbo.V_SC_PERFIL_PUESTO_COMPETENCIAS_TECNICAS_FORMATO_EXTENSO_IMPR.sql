SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_PERFIL_PUESTO_COMPETENCIAS_TECNICAS_FORMATO_EXTENSO_IMPR
-- Qué hace: competencias técnicas del perfil para impresión Formato extenso (detalle).
-- Cómo: 1 fila por SC_PERFIL_PUESTO_COMPETENCIAS_TECNICAS; sin auditoría.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO (result set 14).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_PERFIL_PUESTO_COMPETENCIAS_TECNICAS_FORMATO_EXTENSO_IMPR]
AS
SELECT
  CT.[CORR_EMPRESA],
  CT.[CORR_DESCRIPTOR_PUESTO],
  CT.[CORR_PERFIL_PUESTO],
  CT.[CORR_COMPETENCIAS_TECNICAS],
  CT.[CODIGO_COMPETENCIAS_TECNICAS],
  CT.[NOMBRE_COMPETENCIAS_TECNICAS],
  CT.[DESCRIPCION],
  CT.[NIVEL_DOMINIO]
FROM [dbo].[SC_PERFIL_PUESTO_COMPETENCIAS_TECNICAS] CT
GO
