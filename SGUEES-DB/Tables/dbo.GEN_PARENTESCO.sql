-- Qué hace: script de documentación de la tabla GEN_PARENTESCO (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (sin crear/alterar la tabla).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_PARENTESCO
Fuente: estructura leída desde SGUEES (solo documentación; no ejecutar CREATE TABLE en producción).
*/
CREATE TABLE [dbo].[GEN_PARENTESCO]
(
	[CORR_PARENTESCO] [int] NOT NULL,
	[NOMBRE_PARENTESCO] [varchar](50) NULL,
	[DESCRIPCION] [varchar](200) NULL,
	[ACTIVO_PARENTESCO] [bit] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_PARENTESCO] PRIMARY KEY CLUSTERED ([CORR_PARENTESCO] ASC)
);
GO
