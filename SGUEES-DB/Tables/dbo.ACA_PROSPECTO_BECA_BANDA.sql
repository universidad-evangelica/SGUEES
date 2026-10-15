-- Qué hace: script de documentación de la tabla ACA_PROSPECTO_BECA_BANDA (ya existente en BD).
-- Cómo lo hace: refleja columnas, PK, CHECK, defaults, FK e índices consultados en SQL Server (sin crear/alterar la tabla).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.ACA_PROSPECTO_BECA_BANDA
Fuente: estructura leída desde SGUEES (solo documentación; no ejecutar CREATE TABLE en producción).
Sin FK. Sin índices adicionales. Sin columnas calculadas. Sin triggers.
*/
CREATE TABLE [dbo].[ACA_PROSPECTO_BECA_BANDA]
(
	[CORR_BANDA] [int] IDENTITY(1,1) NOT NULL,
	[CODIGO_REGLA] [varchar(30)] NOT NULL,
	[VALOR_DESDE] [decimal(10,2)] NOT NULL,
	[VALOR_HASTA] [decimal(10,2)] NOT NULL,
	[PUNTAJE] [decimal(10,2)] NOT NULL,
	[ACTIVO] [bit] NOT NULL,
	[CORR_EMPRESA] [int] NOT NULL,
	[USUARIO_CREA] [varchar(30)] NOT NULL,
	[ESTACION_CREA] [varchar(30)] NOT NULL,
	[FECHA_CREA] [datetime] NOT NULL,
	CONSTRAINT [PK_ACA_PROSPECTO_BECA_BANDA] PRIMARY KEY CLUSTERED ([CORR_BANDA] ASC)
);
GO

ALTER TABLE [dbo].[ACA_PROSPECTO_BECA_BANDA] ADD CONSTRAINT [DF_ACA_PROSPECTO_BECA_BANDA_ACTIVO] DEFAULT ((1)) FOR [ACTIVO]
GO

ALTER TABLE [dbo].[ACA_PROSPECTO_BECA_BANDA] ADD CONSTRAINT [DF_ACA_PROSPECTO_BECA_BANDA_FECHA] DEFAULT (getdate()) FOR [FECHA_CREA]
GO
-- Sin FK.
-- Sin índices adicionales.
-- Sin triggers.
