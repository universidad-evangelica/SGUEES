-- Qué hace: script de documentación de GEN_PERSONA_JURIDICA (ya existente en BD).
-- Cómo lo hace: refleja columnas consultadas en SQL Server (solo documentación).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_PERSONA_JURIDICA
Fuente: estructura real BD SGUEES (solo documentación; no ejecutar CREATE en producción).
PK: CORR_PERSONA_JURIDICA. CORR_PERSONA vincula al hub GEN_PERSONA.
*/
CREATE TABLE [dbo].[GEN_PERSONA_JURIDICA]
(
	[CORR_PERSONA] [bigint] NULL,
	[CORR_PERSONA_JURIDICA] [bigint] NOT NULL,
	[NOMBRE_EMPRESA] [varchar](125) NULL,
	[RAZON_SOCIAL] [varchar](200) NULL,
	[GIRO] [varchar](150) NULL,
	[ES_EXTRANJERO] [bit] NULL,
	[DOMICILIADO] [varchar](2) NULL,
	[CORR_TIPO_CONTRIBUYENTE] [int] NULL,
	[CORR_ACTIVIDAD_ECONOMICA] [int] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_PERSONA_JURIDICA] PRIMARY KEY CLUSTERED ([CORR_PERSONA_JURIDICA] ASC)
);
GO
