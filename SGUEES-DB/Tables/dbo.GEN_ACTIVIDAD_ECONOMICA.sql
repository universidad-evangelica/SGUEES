-- Qué hace: script de documentación de la tabla GEN_ACTIVIDAD_ECONOMICA (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (sin crear/alterar la tabla).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_ACTIVIDAD_ECONOMICA
Fuente: estructura leída desde SGUEES (solo documentación; no ejecutar CREATE TABLE en producción).
*/
CREATE TABLE [dbo].[GEN_ACTIVIDAD_ECONOMICA]
(
	[CORR_ACTIVIDAD_ECONOMICA] [int] NOT NULL,
	[CODIGO_ACTIVIDAD_ECONOMICA] [char](5) NULL,
	[NOMBRE_ACTIVIDAD_ECONOMICA] [varchar](255) NULL,
	[ACTIVO_ACTIVIDAD_ECONOMICA] [bit] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_ACTIVIDAD_ECONOMICA] PRIMARY KEY CLUSTERED ([CORR_ACTIVIDAD_ECONOMICA] ASC)
);
GO
