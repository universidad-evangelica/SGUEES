SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_EMPLEADO_IMPR
-- Qué hace: nombre del empleado cargado en el descriptor, para el PDF.
-- Cómo: 1 fila por empleado de SC_DESCRIPTOR_PUESTO_EMPLEADO. El SP filtra
--       el CORR_EMPLEADO seleccionado, así el reporte no lista a los demás.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO y _EXTENSO.
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_EMPLEADO_IMPR]
AS
SELECT
  X.[CORR_EMPRESA],
  X.[CORR_DESCRIPTOR_PUESTO],
  X.[CORR_EMPLEADO],
  E.[NOMBRE_EMPLEADO]
FROM [dbo].[SC_DESCRIPTOR_PUESTO_EMPLEADO] X
INNER JOIN [dbo].[V_GEN_EMPLEADO] E
  ON E.[CORR_EMPRESA] = X.[CORR_EMPRESA]
 AND E.[CORR_EMPLEADO] = X.[CORR_EMPLEADO]
GO
