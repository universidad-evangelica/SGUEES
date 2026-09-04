SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_FUNCIONES_IMPR
-- Qué hace: listas de funciones CLAVE y SECUNDARIA agregadas para Formato corto.
-- Cómo: 1 fila por descriptor; numeradas desde 1 y separadas por CRLF en cada
--       campo (cuadro Can Grow en Crystal). FOR XML PATH por compatibilidad BD 100.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO (result set 3).
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_FUNCIONES_IMPR]
AS
SELECT
  A.[CORR_EMPRESA],
  A.[CORR_DESCRIPTOR_PUESTO],
  -- Funciones CLAVE numeradas ("1. Nombre") en un solo texto, una por línea.
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
  ).value(N'.', N'NVARCHAR(MAX)'), 1, 2, N'') AS [LISTA_FUNCIONES_SECUNDARIA]
FROM [dbo].[SC_DESCRIPTOR_PUESTO] A
GO
