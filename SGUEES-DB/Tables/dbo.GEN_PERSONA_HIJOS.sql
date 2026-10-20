-- Qué hace: script de documentación de GEN_PERSONA_HIJOS (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (solo documentación).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_PERSONA_HIJOS
Fuente: estructura real BD SGUEES (solo documentación; no ejecutar CREATE TABLE).
PK: (CORR_EMPRESA, CORR_PERSONA, CORR_HIJO)
*/
CREATE TABLE [dbo].[GEN_PERSONA_HIJOS]
(
	[CORR_EMPRESA] [int] NOT NULL,
	[CORR_PERSONA] [bigint] NOT NULL,
	[CORR_HIJO] [int] NOT NULL,
	[NOMBRE_COMPLETO] [varchar](100) NULL,
	[EDAD] [int] NULL,
	[SEXO] [varchar](25) NULL,
	[FECHA_NACIMIENTO] [date] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_PERSONA_HIJOS] PRIMARY KEY CLUSTERED
	(
		[CORR_EMPRESA] ASC,
		[CORR_PERSONA] ASC,
		[CORR_HIJO] ASC
	)
);
GO
