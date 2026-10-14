-- Qué hace: script de documentación de la tabla GEN_TIPO_DOCUMENTO_IDENTIDAD (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (sin crear/alterar la tabla).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_TIPO_DOCUMENTO_IDENTIDAD
Fuente: estructura leída desde SGUEES (solo documentación; no ejecutar CREATE TABLE en producción).
Columnas: FORMATO_CARACTERES CHECK IN ('LETRAS','NUMEROS','AMBOS'),
          APLICA_PARA CHECK IN ('NACIONALES','EXTRANJEROS','AMBOS') — listas vía GEN_LISTA.
*/
CREATE TABLE [dbo].[GEN_TIPO_DOCUMENTO_IDENTIDAD]
(
	[CORR_TIPO_DOCUMENTO_IDENTIDAD] [int] NOT NULL,
	[NOMBRE_TIPO_DOCUMENTO_IDENTIDAD] [varchar](25) NULL,
	[NOMBRE_CORTO] [varchar](15) NULL,
	[ACTIVO_TIPO_DOCUMENTO_IDENTIDAD] [bit] NULL,
	[NUMERO_CARACTERES] [smallint] NULL,
	[ACTIVO_CARACTERES] [bit] NULL,
	[FORMATO_CARACTERES] [varchar](25) NULL,
	[APLICA_PARA] [varchar](25) NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_TIPO_DOCUMENTO_IDENTIDAD] PRIMARY KEY CLUSTERED ([CORR_TIPO_DOCUMENTO_IDENTIDAD] ASC)
);
GO
