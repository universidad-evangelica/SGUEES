-- Qué hace: script de documentación de la tabla ACA_SE_BANDA (rangos numéricos de puntaje SE).
-- Cómo lo hace: mismo patrón que ACA_PROSPECTO_BECA_BANDA; CODIGO_REGLA + VALOR_DESDE/HASTA → PUNTAJE.
-- Nota: crear la tabla en BD con esta definición; luego se revalida contra SQL Server.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.ACA_SE_BANDA
Fuente: propuesta alineada a ACA_PROSPECTO_BECA_BANDA.
Sin FK. Sin índices adicionales. Sin columnas calculadas. Sin triggers.
*/
CREATE TABLE [dbo].[ACA_SE_BANDA]
(
	[CORR_BANDA] [int] IDENTITY(1,1) NOT NULL,
	[CODIGO_REGLA] [varchar](30) NOT NULL,
	[VALOR_DESDE] [decimal](10,2) NOT NULL,
	[VALOR_HASTA] [decimal](10,2) NOT NULL,
	[PUNTAJE] [decimal](10,2) NOT NULL,
	[ACTIVO] [bit] NOT NULL,
	[CORR_EMPRESA] [int] NOT NULL,
	[USUARIO_CREA] [varchar](30) NOT NULL,
	[ESTACION_CREA] [varchar](30) NOT NULL,
	[FECHA_CREA] [datetime] NOT NULL,
	CONSTRAINT [PK_ACA_SE_BANDA] PRIMARY KEY CLUSTERED ([CORR_BANDA] ASC)
);
GO

ALTER TABLE [dbo].[ACA_SE_BANDA] ADD CONSTRAINT [DF_ACA_SE_BANDA_ACTIVO] DEFAULT ((1)) FOR [ACTIVO];
GO

ALTER TABLE [dbo].[ACA_SE_BANDA] ADD CONSTRAINT [DF_ACA_SE_BANDA_EMP] DEFAULT ((1)) FOR [CORR_EMPRESA];
GO

ALTER TABLE [dbo].[ACA_SE_BANDA] ADD CONSTRAINT [DF_ACA_SE_BANDA_FECHA] DEFAULT (getdate()) FOR [FECHA_CREA];
GO

ALTER TABLE [dbo].[ACA_SE_BANDA] ADD CONSTRAINT [DF_ACA_SE_BANDA_PUNTAJE] DEFAULT ((0)) FOR [PUNTAJE];
GO
-- Sin FK.
-- Sin índices adicionales.
-- Sin triggers.
