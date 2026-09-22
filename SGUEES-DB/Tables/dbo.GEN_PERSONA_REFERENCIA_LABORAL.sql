-- Qué hace: script de documentación de GEN_PERSONA_REFERENCIA_LABORAL (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (solo documentación).
-- Notas: sin columnas calculadas; sin CHECK; FK a GEN_EMPRESA y GEN_PERSONA.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_PERSONA_REFERENCIA_LABORAL
Fuente: estructura real BD SGUEES (solo documentación; no ejecutar CREATE TABLE).
PK: (CORR_EMPRESA, CORR_PERSONA, CORR_REFERENCIA_LABORAL)
Uso: tab Referencias de gen-empleado — referencias laborales.
*/
CREATE TABLE [dbo].[GEN_PERSONA_REFERENCIA_LABORAL]
(
	[CORR_EMPRESA] [int] NOT NULL,
	[CORR_PERSONA] [bigint] NOT NULL,
	[CORR_REFERENCIA_LABORAL] [int] NOT NULL,
	[NOMBRE_COMPLETO] [varchar](100) NULL,
	[LUGAR_TRABAJO] [varchar](150) NULL,
	[TELEFONO] [varchar](25) NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_PERSONA_REFERENCIA_LABORAL] PRIMARY KEY CLUSTERED
	(
		[CORR_EMPRESA] ASC,
		[CORR_PERSONA] ASC,
		[CORR_REFERENCIA_LABORAL] ASC
	)
);
GO
