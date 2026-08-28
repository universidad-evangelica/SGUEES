SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_IMPR
-- Qué hace: forma de datos para impresión Formato corto (descriptor + funciones).
-- Cómo: 1 fila por indicador (SC_DESCRIPTOR_PUESTO_KPI_FUNCION); si no hay
--       indicadores, 1 fila del descriptor. Las funciones NO generan filas: van
--       agregadas en LISTA_FUNCIONES_CLAVE / LISTA_FUNCIONES_SECUNDARIA,
--       numeradas desde 1 y separadas por CRLF, para un cuadro que crece.
--       Se usa FOR XML PATH porque el nivel de compatibilidad de la BD (100) no
--       admite STRING_AGG con WITHIN GROUP (ORDER BY).
-- Uso: SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO / Crystal SGUEES-RPT.
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_IMPR]
AS
SELECT
  A.[CORR_EMPRESA],
  A.[CORR_DESCRIPTOR_PUESTO],
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
  A.[FECHA_ACTU],
  -- Funciones CLAVE numeradas ("1. Nombre") en un solo texto, una por línea.
  -- El STUFF quita el CRLF inicial; .value() evita que XML escape & < >.
  STUFF((
    SELECT CHAR(13) + CHAR(10) + CAST(N.[NUM_ORDEN] AS NVARCHAR(10)) + N'. ' + N.[NOMBRE_FUNCION]
    FROM (
      SELECT
        ROW_NUMBER() OVER (ORDER BY F.[CORR_FUNCION]) AS [NUM_ORDEN],
        F.[NOMBRE_FUNCION]
      FROM [dbo].[SC_DESCRIPTOR_PUESTO_FUNCION] F
      WHERE F.[CORR_EMPRESA] = A.[CORR_EMPRESA]
        AND F.[CORR_DESCRIPTOR_PUESTO] = A.[CORR_DESCRIPTOR_PUESTO]
        AND RTRIM(F.[TIPO_FUNCION]) = N'CLAVE'
    ) N
    ORDER BY N.[NUM_ORDEN]
    FOR XML PATH(N''), TYPE
  ).value(N'.', N'NVARCHAR(MAX)'), 1, 2, N'') AS [LISTA_FUNCIONES_CLAVE],
  -- Mismo armado para las funciones SECUNDARIA (numeración propia desde 1).
  STUFF((
    SELECT CHAR(13) + CHAR(10) + CAST(N.[NUM_ORDEN] AS NVARCHAR(10)) + N'. ' + N.[NOMBRE_FUNCION]
    FROM (
      SELECT
        ROW_NUMBER() OVER (ORDER BY F.[CORR_FUNCION]) AS [NUM_ORDEN],
        F.[NOMBRE_FUNCION]
      FROM [dbo].[SC_DESCRIPTOR_PUESTO_FUNCION] F
      WHERE F.[CORR_EMPRESA] = A.[CORR_EMPRESA]
        AND F.[CORR_DESCRIPTOR_PUESTO] = A.[CORR_DESCRIPTOR_PUESTO]
        AND RTRIM(F.[TIPO_FUNCION]) = N'SECUNDARIA'
    ) N
    ORDER BY N.[NUM_ORDEN]
    FOR XML PATH(N''), TYPE
  ).value(N'.', N'NVARCHAR(MAX)'), 1, 2, N'') AS [LISTA_FUNCIONES_SECUNDARIA],
  -- Indicadores de desempeño: van fila por fila al detalle del reporte.
  K.[CORR_KPI_FUNCION],
  K.[NOMBRE_INDICADOR],
  K.[META],
  K.[CORR_FRECUENCIA],
  K.[NOMBRE_FRECUENCIA]
FROM [dbo].[SC_DESCRIPTOR_PUESTO] A
LEFT JOIN [dbo].[GEN_EMPLEADO] E
  ON E.[CORR_EMPRESA] = A.[CORR_EMPRESA]
 AND E.[CORR_EMPLEADO] = A.[CORR_PUESTO_REPORTA]
LEFT JOIN [dbo].[SC_DESCRIPTOR_PUESTO_KPI_FUNCION] K
  ON K.[CORR_EMPRESA] = A.[CORR_EMPRESA]
 AND K.[CORR_DESCRIPTOR_PUESTO] = A.[CORR_DESCRIPTOR_PUESTO]
GO
