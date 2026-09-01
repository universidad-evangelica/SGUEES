SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_PERFIL_PUESTO_FORMATO_CORTO_IMPR
-- Qué hace: perfil del puesto del descriptor para impresión Formato corto.
-- Cómo: 1 fila por SC_PERFIL_PUESTO; sin campos de auditoría.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO (result set 7).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_PERFIL_PUESTO_FORMATO_CORTO_IMPR]
AS
SELECT
  P.[CORR_EMPRESA],
  P.[CORR_DESCRIPTOR_PUESTO],
  P.[CORR_PERFIL_PUESTO],
  P.[EDAD_MINIMA],
  P.[EDAD_MAXIMA],
  P.[SEXO],
  P.[ESTADO_FAMILIAR],
  P.[LICENCIA],
  P.[CORR_DISPONIBILIDAD_HORARIO],
  P.[NOMBRE_DISPONIBILIDAD_HORARIO],
  P.[CORR_TIPO_MODALIDAD],
  P.[NOMBRE_MODALIDAD],
  P.[OTROS]
FROM [dbo].[SC_PERFIL_PUESTO] P
GO
