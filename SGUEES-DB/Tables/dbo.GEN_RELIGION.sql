-- Qué hace: script de documentación de la tabla GEN_RELIGION (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (sin crear/alterar la tabla).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_RELIGION
Fuente: estructura leída desde SGUEES (solo documentación; no ejecutar CREATE TABLE en producción).
*/
CREATE TABLE [dbo].[GEN_RELIGION]
(
	[CORR_RELIGION] [int] NOT NULL,
	[NOMBRE_RELIGION] [varchar](100) NULL,
	[DESCRIPCION] [varchar](200) NULL,
	[ACTIVO_RELIGION] [bit] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_RELIGION] PRIMARY KEY CLUSTERED ([CORR_RELIGION] ASC)
);
GO
