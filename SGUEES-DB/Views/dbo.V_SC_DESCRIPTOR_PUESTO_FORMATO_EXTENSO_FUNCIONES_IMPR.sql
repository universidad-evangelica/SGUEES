SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_FUNCIONES_IMPR
-- Qué hace: funciones CLAVE del descriptor para impresión Formato extenso (detalle).
-- Cómo: 1 fila por SC_DESCRIPTOR_PUESTO_FUNCION con TIPO_FUNCION = CLAVE;
--       no agrega lista (distinto al Formato corto); sin auditoría ni secundarias.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO (result set 3).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_FUNCIONES_IMPR]
AS
SELECT
  F.[CORR_EMPRESA],
  F.[CORR_DESCRIPTOR_PUESTO],
  F.[CORR_FUNCION],
  F.[NOMBRE_FUNCION],
  RTRIM(F.[TIPO_FUNCION]) AS [TIPO_FUNCION]
FROM [dbo].[SC_DESCRIPTOR_PUESTO_FUNCION] F
WHERE RTRIM(F.[TIPO_FUNCION]) = N'CLAVE'
GO
