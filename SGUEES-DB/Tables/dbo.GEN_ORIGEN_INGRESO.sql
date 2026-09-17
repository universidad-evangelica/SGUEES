-- Qué hace: script de documentación de la tabla GEN_ORIGEN_INGRESO (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (sin crear/alterar la tabla).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_ORIGEN_INGRESO
Fuente: estructura leída desde SGUEES (solo documentación; no ejecutar CREATE TABLE en producción).
*/
CREATE TABLE [dbo].[GEN_ORIGEN_INGRESO]
(
	[CORR_ORIGEN_INGRESO] [int] NOT NULL,
	[NOMBRE_ORIGEN_INGRESO] [varchar](25) NULL,
	[ACTIVO_ORIGEN_INGRESO] [bit] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_ORIGEN_INGRESO] PRIMARY KEY CLUSTERED ([CORR_ORIGEN_INGRESO] ASC)
);
GO
