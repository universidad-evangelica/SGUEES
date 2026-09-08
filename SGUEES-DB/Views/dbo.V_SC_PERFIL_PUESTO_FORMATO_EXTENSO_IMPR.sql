SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_PERFIL_PUESTO_FORMATO_EXTENSO_IMPR
-- Qué hace: perfil del puesto del descriptor para impresión Formato extenso.
-- Cómo: 1 fila por SC_PERFIL_PUESTO; LICENCIA_TEXTO = 'Sí'/'No' según bit;
--       sin auditoría (OTROS se omite: solo corto/ambos en UI).
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO (result set 11).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_PERFIL_PUESTO_FORMATO_EXTENSO_IMPR]
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
  CASE
    WHEN P.[LICENCIA] = 1 THEN CAST(N'Sí' AS NVARCHAR(3))
    WHEN P.[LICENCIA] = 0 THEN CAST(N'No' AS NVARCHAR(3))
    ELSE CAST(N'' AS NVARCHAR(3))
  END AS [LICENCIA_TEXTO],
  P.[CORR_DISPONIBILIDAD_HORARIO],
  P.[NOMBRE_DISPONIBILIDAD_HORARIO],
  P.[CORR_TIPO_MODALIDAD],
  P.[NOMBRE_MODALIDAD]
FROM [dbo].[SC_PERFIL_PUESTO] P
GO
