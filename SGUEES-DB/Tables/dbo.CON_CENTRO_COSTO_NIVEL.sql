-- Qué hace: script de documentación de la tabla CON_CENTRO_COSTO_NIVEL (ya existe en BD).
-- Cómo lo hace: refleja la estructura consultada en SQL Server (PK empresa + correlativo).
CREATE TABLE [dbo].[CON_CENTRO_COSTO_NIVEL] (
	[CORR_EMPRESA] [int] NOT NULL,
	[CORR_CENTRO_COSTO_NIVEL] [int] NOT NULL,
	[NOMBRE_NIVEL] [varchar](30) NULL,
	[NIVEL] [smallint] NULL,
	[USUARIO_CREA] [varchar](50) NULL,
	[ESTACION_CREA] [varchar](50) NULL,
	[FECHA_CREA] [datetime] NULL,
	[USUARIO_ACTU] [varchar](50) NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	[FECHA_ACTU] [datetime] NULL,
	CONSTRAINT [PK_CON_CENTRO_COSTO_NIVEL] PRIMARY KEY CLUSTERED ([CORR_EMPRESA], [CORR_CENTRO_COSTO_NIVEL])
)
ON [PRIMARY]
GO
