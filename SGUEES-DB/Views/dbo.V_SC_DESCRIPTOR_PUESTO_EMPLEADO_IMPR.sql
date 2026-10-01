SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_EMPLEADO_IMPR
-- Qué hace: nombre y fecha de ingreso del empleado cargado, para el PDF.
-- Cómo: 1 fila por empleado de SC_DESCRIPTOR_PUESTO_EMPLEADO. La fecha es la
--       guardada al cargar (no la del maestro). El SP filtra el CORR_EMPLEADO
--       seleccionado, así el reporte no lista a los demás. Fecha en dd/MM/yyyy.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO y _EXTENSO.
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_EMPLEADO_IMPR]
AS
SELECT
  X.[CORR_EMPRESA],
  X.[CORR_DESCRIPTOR_PUESTO],
  X.[CORR_EMPLEADO],
  E.[NOMBRE_EMPLEADO],
  CONVERT(VARCHAR(10), X.[FECHA_INGRESO], 103) AS [FECHA_INGRESO]
FROM [dbo].[SC_DESCRIPTOR_PUESTO_EMPLEADO] X
INNER JOIN [dbo].[V_GEN_EMPLEADO] E
  ON E.[CORR_EMPRESA] = X.[CORR_EMPRESA]
 AND E.[CORR_EMPLEADO] = X.[CORR_EMPLEADO]
GO
