-- Qué hace: script de documentación de la tabla GEN_TIPO_CONTACTO (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (sin crear/alterar la tabla).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_TIPO_CONTACTO
Fuente: estructura leída desde SGUEES (solo documentación; no ejecutar CREATE TABLE en producción).
*/
CREATE TABLE [dbo].[GEN_TIPO_CONTACTO]
(
	[CORR_TIPO_CONTACTO] [int] NOT NULL,
	[NOMBRE_TIPO_CONTACTO] [varchar](50) NULL,
	[NOMBRE_CORTO] [varchar](15) NULL,
	[ACTIVO_TIPO_CONTACTO] [bit] NULL,
	[NUMERO_CARACTERES] [smallint] NULL,
	[ACTIVO_CARACTERES] [bit] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_TIPO_CONTACTO] PRIMARY KEY CLUSTERED ([CORR_TIPO_CONTACTO] ASC)
);
GO
