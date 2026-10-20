-- Qué hace: script de documentación de la tabla GEN_PERSONA (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (no crear/alterar en BD desde aquí).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_PERSONA
Fuente: estructura real BD SGUEES (solo documentación).
*/
CREATE TABLE [dbo].[GEN_PERSONA]
(
	[CORR_PERSONA] [bigint] NOT NULL,
	[CODIGO_PERSONA] [varchar](20) NULL,
	[ACTIVO_PERSONA] [bit] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_PERSONA] PRIMARY KEY CLUSTERED ([CORR_PERSONA] ASC)
);
GO
