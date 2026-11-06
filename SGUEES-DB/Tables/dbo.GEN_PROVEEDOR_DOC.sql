-- Qué hace: documentación / definición de GEN_PROVEEDOR_DOC (adjuntos por URL).
-- Cómo: ver Scripts/ALTER_GEN_PROVEEDOR_DOC_URL.sql para migración idempotente.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_PROVEEDOR_DOC
PK: (CORR_EMPRESA, CORR_PROVEEDOR, CORR_DOCUMENTO)
URL_DOCUMENTO: ruta relativa /uploads/gen-proveedor-doc/{emp}_{prov}_{doc}.ext
*/
CREATE TABLE [dbo].[GEN_PROVEEDOR_DOC]
(
	[CORR_EMPRESA] [int] NOT NULL,
	[CORR_PROVEEDOR] [int] NOT NULL,
	[CORR_DOCUMENTO] [int] NOT NULL,
	[URL_DOCUMENTO] [nvarchar](500) NOT NULL,
	[NOMBRE_ARCHIVO] [nvarchar](260) NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	CONSTRAINT [PK_GEN_PROVEEDOR_DOC] PRIMARY KEY CLUSTERED
	(
		[CORR_EMPRESA] ASC,
		[CORR_PROVEEDOR] ASC,
		[CORR_DOCUMENTO] ASC
	)
);
GO
