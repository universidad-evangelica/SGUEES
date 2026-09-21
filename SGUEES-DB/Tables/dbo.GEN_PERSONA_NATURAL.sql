-- Qué hace: script de documentación de la tabla GEN_PERSONA_NATURAL (ya existente en BD).
-- Cómo lo hace: refleja columnas consultadas en SQL Server (solo documentación; NOMBRE_COMPLETO es computed).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_PERSONA_NATURAL
Fuente: estructura real BD SGUEES (solo documentación).
NOMBRE_COMPLETO es columna calculada en BD.
*/
CREATE TABLE [dbo].[GEN_PERSONA_NATURAL]
(
	[CORR_PERSONA] [bigint] NULL,
	[CORR_PERSONA_NATURAL] [bigint] NOT NULL,
	[PRIMER_NOMBRE] [varchar](50) NULL,
	[SEGUNDO_NOMBRE] [varchar](50) NULL,
	[PRIMER_APELLIDO] [varchar](50) NULL,
	[SEGUNDO_APELLIDO] [varchar](50) NULL,
	[APELLIDO_CASADA] [varchar](50) NULL,
	[FOTO_URL] [varchar](500) NULL,
	[SEXO] [varchar](25) NULL,
	[ESTADO_CIVIL] [varchar](25) NULL,
	[NACIONALIDAD] [varchar](25) NULL,
	[EDAD] [int] NULL,
	[FECHA_NACIMIENTO] [date] NULL,
	[ES_JUBILADO] [bit] NULL,
	[POSEE_DISCAPACIDAD] [bit] NULL,
	[TIPO_DISCAPACIDAD] [varchar](250) NULL,
	[CORR_RELIGION] [int] NULL,
	[IGLESIA_CONGREGA] [varchar](50) NULL,
	[CARTA_PASTORAL] [varchar](2) NULL,
	[ES_EXTRANJERO] [bit] NULL,
	[DOMICILIADO] [varchar](2) NULL,
	[CORR_PAIS_NACIMIENTO] [int] NULL,
	[CORR_DEPTO_NACIMIENTO] [int] NULL,
	[CORR_MUNICIPIO_NACIMIENTO] [int] NULL,
	[CORR_DISTRITO_NACIMIENTO] [int] NULL,
	[CORR_ORIGEN_INGRESO] [int] NULL,
	[CORR_TIPO_CONTRIBUYENTE] [int] NULL,
	[CORR_ACTIVIDAD_ECONOMICA] [int] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_PERSONA_NATURAL] PRIMARY KEY CLUSTERED ([CORR_PERSONA_NATURAL] ASC)
);
GO
