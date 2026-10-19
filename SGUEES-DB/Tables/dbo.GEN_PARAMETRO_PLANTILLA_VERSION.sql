CREATE TABLE [dbo].[GEN_PARAMETRO_PLANTILLA_VERSION]
(
    [CORR_EMPRESA]                     [int] NOT NULL,
    [CORR_PARAMETRO_PLANTILLA]         [int] NOT NULL,
    [NUMERO_VERSION]                   [int] NOT NULL,
    [ASUNTO_PLANTILLA]                 [varchar] (255) COLLATE Latin1_General_CS_AS NOT NULL,
    [CUERPO_PLANTILLA]                 [nvarchar] (max) NULL,
    [CORREO_CC]                        [varchar] (255) COLLATE Latin1_General_CS_AS NULL,
    [CORREO_CCO]                       [varchar] (255) COLLATE Latin1_General_CS_AS NULL,
    [ES_VERSION_ACTIVA]                [bit] NOT NULL CONSTRAINT [DF_GEN_PARAMETRO_PLANTILLA_VERSION_ACTIVA] DEFAULT ((1)),
    [MOTIVO_VERSION]                   [varchar] (255) COLLATE Latin1_General_CS_AS NULL,
    [USUARIO_CREA]                     [varchar] (50) COLLATE Latin1_General_CS_AS NULL,
    [ESTACION_CREA]                    [varchar] (50) COLLATE Latin1_General_CS_AS NULL,
    [FECHA_CREA]                       [datetime] NULL,
    [USUARIO_ACTU]                     [varchar] (50) COLLATE Latin1_General_CS_AS NULL,
    [ESTACION_ACTU]                    [varchar] (50) COLLATE Latin1_General_CS_AS NULL,
    [FECHA_ACTU]                       [datetime] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- Llave Primaria Compuesta (Empresa, Plantilla y Número de Versión)
ALTER TABLE [dbo].[GEN_PARAMETRO_PLANTILLA_VERSION] 
    ADD CONSTRAINT [PK_GEN_PARAMETRO_PLANTILLA_VERSION] 
    PRIMARY KEY CLUSTERED ([CORR_EMPRESA] ASC, [CORR_PARAMETRO_PLANTILLA] ASC, [NUMERO_VERSION] ASC) 
    ON [PRIMARY]
GO

-- Llave Foránea hacia Empresa
ALTER TABLE [dbo].[GEN_PARAMETRO_PLANTILLA_VERSION] 
    ADD CONSTRAINT [FK_GEN_PARAMETRO_PLANTILLA_VERSION_GEN_EMPRESA] 
    FOREIGN KEY ([CORR_EMPRESA]) 
    REFERENCES [dbo].[GEN_EMPRESA] ([CORR_EMPRESA])
GO

-- Llave Foránea hacia la Plantilla Maestra
ALTER TABLE [dbo].[GEN_PARAMETRO_PLANTILLA_VERSION] 
    ADD CONSTRAINT [FK_GEN_PARAMETRO_PLANTILLA_VERSION_GEN_PARAMETRO_PLANTILLA] 
    FOREIGN KEY ([CORR_EMPRESA], [CORR_PARAMETRO_PLANTILLA]) 
    REFERENCES [dbo].[GEN_PARAMETRO_PLANTILLA] ([CORR_EMPRESA], [CORR_PARAMETRO_PLANTILLA])
GO

-- Sin índices adicionales.
-- Sin checks adicionales.
-- Sin triggers.
