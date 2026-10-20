-- Qué hace: script de documentación de la tabla PLA_AFP (ya existente en BD).
-- Cómo lo hace: refleja la estructura objetivo (Activo + Auditoría).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.PLA_AFP
Fuente: estructura objetivo SGUEES (documentación; aplicar ALTER_PLA_AFP_SEGURO_SOCIAL_ACTIVO_AUDITORIA.sql en BD).
*/
CREATE TABLE [dbo].[PLA_AFP]
(
	[CORR_AFP] [int] NOT NULL,
	[NOMBRE_AFP] [varchar](150) NOT NULL,
	[NOMBRE_CORTO_AFP] [varchar](50) NOT NULL,
	[CODIGO_SGVPP] [varchar](5) NULL,
	[INCLUYE_SEPP] [bit] NULL,
	[ACTIVO_AFP] [bit] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_PLA_AFP] PRIMARY KEY CLUSTERED ([CORR_AFP] ASC)
);
GO
