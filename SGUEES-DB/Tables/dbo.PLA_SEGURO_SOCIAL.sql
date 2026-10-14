-- Qué hace: script de documentación de la tabla PLA_SEGURO_SOCIAL (ya existente en BD).
-- Cómo lo hace: refleja la estructura objetivo (Activo + Auditoría).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.PLA_SEGURO_SOCIAL
Fuente: estructura objetivo SGUEES (documentación; aplicar ALTER_PLA_AFP_SEGURO_SOCIAL_ACTIVO_AUDITORIA.sql en BD).
*/
CREATE TABLE [dbo].[PLA_SEGURO_SOCIAL]
(
	[CORR_SEGURO_SOCIAL] [int] NOT NULL,
	[NOMBRE_SEGURO_SOCIAL] [varchar](150) NULL,
	[NOMBRE_CORTO_SEGURO] [varchar](50) NULL,
	[ACTIVO_SEGURO_SOCIAL] [bit] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_PLA_SEGURO_SOCIAL] PRIMARY KEY CLUSTERED ([CORR_SEGURO_SOCIAL] ASC)
);
GO
