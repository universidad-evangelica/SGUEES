SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_IMPR
-- Qué hace: encabezado del descriptor para impresión Formato corto.
-- Cómo: 1 fila por descriptor; fechas como texto dd/MM/yyyy; nombre del jefe
--       desde GEN_EMPLEADO. Funciones y KPIs van en sus vistas _IMPR del corto.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO (result set 1).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_IMPR]
AS
SELECT
  A.[CORR_EMPRESA],
  A.[CORR_DESCRIPTOR_PUESTO],
  -- Código legible DES-#### sellado al crear el descriptor.
  A.[CODIGO_DESCRIPTOR_PUESTO],
  -- Fechas como texto dd/MM/yyyy: al pasar por DateTime de .NET, un DATE arrastra
  -- la hora 00:00:00 y Crystal la imprime. Formateadas aquí llegan limpias.
  CONVERT(VARCHAR(10), A.[FECHA_EMISION], 103) AS [FECHA_EMISION],
  CONVERT(VARCHAR(10), A.[FECHA_REVISION], 103) AS [FECHA_REVISION],
  A.[OBJETIVO_PUESTO],
  A.[NUM_PERSONAL_CARGO],
  A.[CORR_PUESTO],
  A.[NOMBRE_PUESTO],
  A.[CORR_UNIDAD],
  A.[NOMBRE_UNIDAD],
  A.[CORR_PUESTO_REPORTA],
  -- CORR_PUESTO_REPORTA guarda CORR_EMPLEADO del jefe (GEN_EMPLEADO).
  E.[NOMBRE_EMPLEADO] AS [NOMBRE_EMPLEADO_REPORTA],
  A.[CORR_IMPACTO_ECONOMICO],
  A.[DESCRIPCION_IMPACTO_ECONOMICO],
  A.[RESPONSABLE],
  A.[FORMATO],
  A.[VERSION],
  A.[CORR_ESTADO],
  A.[NOMBRE_ESTADO],
  A.[USUARIO_CREA],
  A.[ESTACION_CREA],
  A.[FECHA_CREA],
  A.[USUARIO_ACTU],
  A.[ESTACION_ACTU],
  A.[FECHA_ACTU]
FROM [dbo].[SC_DESCRIPTOR_PUESTO] A
LEFT JOIN [dbo].[GEN_EMPLEADO] E
  ON E.[CORR_EMPRESA] = A.[CORR_EMPRESA]
 AND E.[CORR_EMPLEADO] = A.[CORR_PUESTO_REPORTA]
GO
