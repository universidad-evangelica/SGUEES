-- Qué hace: script de documentación de la tabla GEN_EMPRESA_PERSONA (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (solo documentación).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_EMPRESA_PERSONA
Fuente: estructura real BD SGUEES (solo documentación).
*/
CREATE TABLE [dbo].[GEN_EMPRESA_PERSONA]
(
	[CORR_EMPRESA] [int] NOT NULL,
	[CORR_PERSONA] [bigint] NOT NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_EMPRESA_PERSONA] PRIMARY KEY CLUSTERED ([CORR_EMPRESA] ASC, [CORR_PERSONA] ASC)
);
GO
