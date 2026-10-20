-- Qué hace: script de documentación de GEN_PERSONA_FAMILIAR (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (solo documentación).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_PERSONA_FAMILIAR
Fuente: estructura real BD SGUEES (solo documentación; no ejecutar CREATE TABLE).
PK: (CORR_EMPRESA, CORR_PERSONA, CORR_FAMILIAR)
*/
CREATE TABLE [dbo].[GEN_PERSONA_FAMILIAR]
(
	[CORR_EMPRESA] [int] NOT NULL,
	[CORR_PERSONA] [bigint] NOT NULL,
	[CORR_FAMILIAR] [int] NOT NULL,
	[NOMBRE_COMPLETO] [varchar](100) NULL,
	[CORR_PARENTESCO] [int] NULL,
	[TELEFONO] [varchar](25) NULL,
	[DOMICILIO] [varchar](255) NULL,
	[OCUPACION] [varchar](150) NULL,
	[FECHA_NACIMIENTO] [date] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_PERSONA_FAMILIAR] PRIMARY KEY CLUSTERED
	(
		[CORR_EMPRESA] ASC,
		[CORR_PERSONA] ASC,
		[CORR_FAMILIAR] ASC
	)
);
GO
