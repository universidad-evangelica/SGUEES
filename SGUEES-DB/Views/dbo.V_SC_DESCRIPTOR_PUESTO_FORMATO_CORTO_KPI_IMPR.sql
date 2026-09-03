SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_KPI_IMPR
-- Qué hace: indicadores de desempeño del descriptor para Formato corto (detalle).
-- Cómo: 1 fila por SC_DESCRIPTOR_PUESTO_KPI_FUNCION; sin filas si no hay KPIs.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO (result set 4).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_KPI_IMPR]
AS
SELECT
  K.[CORR_EMPRESA],
  K.[CORR_DESCRIPTOR_PUESTO],
  K.[CORR_KPI_FUNCION],
  K.[NOMBRE_INDICADOR],
  K.[META],
  K.[CORR_FRECUENCIA],
  K.[NOMBRE_FRECUENCIA]
FROM [dbo].[SC_DESCRIPTOR_PUESTO_KPI_FUNCION] K
GO
