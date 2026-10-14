-- Qué hace: script de documentación de GEN_PERSONA_DOMICILIO (ya existente en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (solo documentación).
-- Notas: sin CHECK; ACTIVO_DOMICILIO bit; FK a GEN_DISTRITO (territorio) + GEN_PERSONA + GEN_EMPRESA.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_PERSONA_DOMICILIO
Fuente: estructura real BD SGUEES (solo documentación; no ejecutar CREATE TABLE).
PK: (CORR_EMPRESA, CORR_PERSONA, CORR_DOMICILIO)
Uso: tab Direcciones de gen-empleado.
Reglas UI: si DOMICILIADO=SI → SV + depto/municipio/distrito; si NO → solo país (≠SV) + dirección.
*/
CREATE TABLE [dbo].[GEN_PERSONA_DOMICILIO]
(
	[CORR_EMPRESA] [int] NOT NULL,
	[CORR_PERSONA] [bigint] NOT NULL,
	[CORR_DOMICILIO] [int] NOT NULL,
	[DIRECCION] [varchar](255) NULL,
	[CORR_PAIS] [int] NULL,
	[CORR_DEPTO] [int] NULL,
	[CORR_MUNICIPIO] [int] NULL,
	[CORR_DISTRITO] [int] NULL,
	[ACTIVO_DOMICILIO] [bit] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_GEN_PERSONA_DOMICILIO] PRIMARY KEY CLUSTERED
	(
		[CORR_EMPRESA] ASC,
		[CORR_PERSONA] ASC,
		[CORR_DOMICILIO] ASC
	)
);
GO
