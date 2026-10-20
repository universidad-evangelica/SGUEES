SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- =============================================================================
-- Vista: dbo.V_SC_DESCRIPTOR_PUESTO_FIRMAS_IMPR
-- Qué hace: una sola fila por descriptor con las dos firmas del PDF.
-- Cómo: de SC_DESCRIPTOR_PUESTO_FIRMAS toma, por cada TIPO_ACTOR, la de
--       FECHA_FIRMA más reciente y, si empatan el mismo día, la de mayor
--       CORR_FIRMAS. No devuelve la lista de firmas anteriores.
--       TIPO_ACTOR coincide con SEG_FLUJO_ACTOR.NOMBRE_ACTOR.
--       Las fechas van como texto dd/MM/yyyy para que Crystal no imprima la hora.
-- Uso: PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO y _EXTENSO.
-- =============================================================================
CREATE OR ALTER VIEW [dbo].[V_SC_DESCRIPTOR_PUESTO_FIRMAS_IMPR]
AS
WITH FirmasOrdenadas AS (
  SELECT
    F.[CORR_EMPRESA],
    F.[CORR_DESCRIPTOR_PUESTO],
    F.[NOMBRE_COMPLETO],
    F.[TIPO_ACTOR],
    F.[FECHA_FIRMA],
    ROW_NUMBER() OVER (
      PARTITION BY F.[CORR_EMPRESA], F.[CORR_DESCRIPTOR_PUESTO], F.[TIPO_ACTOR]
      ORDER BY F.[FECHA_FIRMA] DESC, F.[CORR_FIRMAS] DESC
    ) AS RN
  FROM [dbo].[SC_DESCRIPTOR_PUESTO_FIRMAS] F
  WHERE F.[TIPO_ACTOR] IN (N'Jefe Inmediato', N'Jefe de Talento Humano')
)
SELECT
  D.[CORR_EMPRESA],
  D.[CORR_DESCRIPTOR_PUESTO],
  JI.[NOMBRE_COMPLETO] AS [NOMBRE_FIRMANTE_JI],
  CAST(N'Jefe Inmediato' AS VARCHAR(50)) AS [TIPO_ACTOR_JI],
  CONVERT(VARCHAR(10), JI.[FECHA_FIRMA], 103) AS [FECHA_FIRMA_JI],
  JTH.[NOMBRE_COMPLETO] AS [NOMBRE_FIRMANTE_JTH],
  CAST(N'Jefe de Talento Humano' AS VARCHAR(50)) AS [TIPO_ACTOR_JTH],
  CONVERT(VARCHAR(10), JTH.[FECHA_FIRMA], 103) AS [FECHA_FIRMA_JTH]
FROM [dbo].[SC_DESCRIPTOR_PUESTO] D
LEFT JOIN FirmasOrdenadas JI
  ON JI.[CORR_EMPRESA] = D.[CORR_EMPRESA]
 AND JI.[CORR_DESCRIPTOR_PUESTO] = D.[CORR_DESCRIPTOR_PUESTO]
 AND JI.[TIPO_ACTOR] = N'Jefe Inmediato'
 AND JI.[RN] = 1
LEFT JOIN FirmasOrdenadas JTH
  ON JTH.[CORR_EMPRESA] = D.[CORR_EMPRESA]
 AND JTH.[CORR_DESCRIPTOR_PUESTO] = D.[CORR_DESCRIPTOR_PUESTO]
 AND JTH.[TIPO_ACTOR] = N'Jefe de Talento Humano'
 AND JTH.[RN] = 1
GO
