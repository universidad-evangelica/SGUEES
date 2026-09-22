-- Qué hace: script de documentación de GEN_PERSONA_FAMILIAR_UEES (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (solo documentación).
-- Notas: sin columnas calculadas; sin CHECK; FK a GEN_EMPRESA, GEN_PERSONA, GEN_PARENTESCO.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_PERSONA_FAMILIAR_UEES
Fuente: estructura real BD SGUEES (solo documentación; no ejecutar CREATE TABLE).
PK: (CORR_EMPRESA, CORR_PERSONA, CORR_FAMILIAR_UEES)
Uso: tab Adicional de gen-empleado — familiares que trabajan en UEES.
*/
CREATE TABLE [dbo].[GEN_PERSONA_FAMILIAR_UEES]
(
	[CORR_EMPRESA] [int] NOT NULL,
	[CORR_PERSONA] [bigint] NOT NULL,
	[CORR_FAMILIAR_UEES] [int] NOT NULL,
	[NOMBRE_COMPLETO] [varchar](100) NULL,
	[CORR_PARENTESCO] [int] NULL,
	[TELEFONO] [varchar](25) NULL,
	[CARGO] [varchar](25) NULL,
	[LUGAR_TRABAJO] [varchar](150) NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_PERSONA_FAMILIAR_UEES] PRIMARY KEY CLUSTERED
	(
		[CORR_EMPRESA] ASC,
		[CORR_PERSONA] ASC,
		[CORR_FAMILIAR_UEES] ASC
	)
);
GO
