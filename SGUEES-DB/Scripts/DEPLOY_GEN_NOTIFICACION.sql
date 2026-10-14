/*
  GEN_NOTIFICACION — tabla + FKs + índices + vista (idempotente)
  Bandeja de notificaciones reutilizable por módulos (empresa + LOGIN_SISTEMA).
  No confundir con dbo.SEG_FLUJO_NOTIFICACION (notificaciones de flujo).

  CORR_NOTIFICACION: entero por empresa (NO IDENTITY).
  Generación del correlativo: RESPONSABILIDAD DEL BACKEND FUTURO
  (reservar dentro de una transacción con bloqueo/concurrencia segura;
   no basta MAX+1 sin bloqueo). Este DDL no genera correlativos.

  Ejecutar:
    sqlcmd -S <srv> -d SGUEES -U <user> -P <pass> -f 65001 -i SGUEES-DB/Scripts/DEPLOY_GEN_NOTIFICACION.sql

  Alcance idempotente:
  - Si la tabla NO existe: la crea completa (columnas, PK, CHECK, DEFAULT).
  - Si la tabla YA existe: no altera columnas ni PK/CHECK existentes;
    solo intenta agregar FKs/índices ausentes y recrear/alterar la vista.
  - No borra datos ni objetos ajenos.
  - No migra esquemas parciales/incompletos de ejecuciones previas.

  Ubicación futura API: Options/General/GEN_NOTIFICACION/
*/

SET NOCOUNT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* ========== TABLA ========== */
IF OBJECT_ID(N'dbo.GEN_NOTIFICACION', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[GEN_NOTIFICACION] (
    [CORR_EMPRESA] [int] NOT NULL,
    [CORR_NOTIFICACION] [int] NOT NULL,
    [LOGIN_SISTEMA] [varchar](30) COLLATE Latin1_General_CS_AS NOT NULL,
    [TITULO] [varchar](200) NOT NULL,
    [MENSAJE] [varchar](1000) NOT NULL,
    [URL_DESTINO] [nvarchar](500) NULL,
    [FECHA_CREA] [datetime] NOT NULL,
    [LEIDA] [bit] NOT NULL CONSTRAINT [DF_GEN_NOTIFICACION_LEIDA] DEFAULT ((0)),
    [FECHA_LECTURA] [datetime] NULL,
    [USUARIO_CREA] [varchar](30) COLLATE Latin1_General_CS_AS NOT NULL,
    [ESTACION_CREA] [varchar](50) COLLATE Latin1_General_CS_AS NOT NULL,
    [USUARIO_ACTU] [varchar](30) COLLATE Latin1_General_CS_AS NULL,
    [ESTACION_ACTU] [varchar](50) COLLATE Latin1_General_CS_AS NULL,
    [FECHA_ACTU] [datetime] NULL,
    CONSTRAINT [PK_GEN_NOTIFICACION] PRIMARY KEY CLUSTERED (
      [CORR_EMPRESA],
      [CORR_NOTIFICACION]
    ),
    CONSTRAINT [CK_GEN_NOTIFICACION_LECTURA] CHECK (
      ([LEIDA] = CAST(0 AS bit) AND [FECHA_LECTURA] IS NULL)
      OR ([LEIDA] = CAST(1 AS bit) AND [FECHA_LECTURA] IS NOT NULL)
    )
  ) ON [PRIMARY];
END
GO

/* ========== FOREIGN KEYS ========== */
/*
  Combinación elegida:
  1) FK a GEN_EMPRESA(CORR_EMPRESA) — la empresa existe.
  2) FK compuesta a SEG_USUARIO_EMPRESA(LOGIN_SISTEMA, CORR_EMPRESA)
     — el destinatario pertenece a esa empresa (PK real de esa tabla).
  No se agrega FK aislada a SEG_USUARIO: queda cubierta por
  SEG_USUARIO_EMPRESA → SEG_USUARIO.
*/

IF OBJECT_ID(N'dbo.GEN_NOTIFICACION', N'U') IS NOT NULL
   AND NOT EXISTS (
     SELECT 1
     FROM sys.foreign_keys
     WHERE name = N'FK_GEN_NOTIFICACION_GEN_EMPRESA'
       AND parent_object_id = OBJECT_ID(N'dbo.GEN_NOTIFICACION')
   )
BEGIN
  ALTER TABLE [dbo].[GEN_NOTIFICACION] ADD CONSTRAINT [FK_GEN_NOTIFICACION_GEN_EMPRESA]
    FOREIGN KEY ([CORR_EMPRESA])
    REFERENCES [dbo].[GEN_EMPRESA] ([CORR_EMPRESA]);
END
GO

IF OBJECT_ID(N'dbo.GEN_NOTIFICACION', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.SEG_USUARIO_EMPRESA', N'U') IS NOT NULL
   AND NOT EXISTS (
     SELECT 1
     FROM sys.foreign_keys
     WHERE name = N'FK_GEN_NOTIFICACION_SEG_USUARIO_EMPRESA'
       AND parent_object_id = OBJECT_ID(N'dbo.GEN_NOTIFICACION')
   )
BEGIN
  ALTER TABLE [dbo].[GEN_NOTIFICACION] ADD CONSTRAINT [FK_GEN_NOTIFICACION_SEG_USUARIO_EMPRESA]
    FOREIGN KEY ([LOGIN_SISTEMA], [CORR_EMPRESA])
    REFERENCES [dbo].[SEG_USUARIO_EMPRESA] ([LOGIN_SISTEMA], [CORR_EMPRESA]);
END
GO

/* ========== ÍNDICES ========== */
/* Listado: empresa + usuario + FECHA_CREA DESC. Marcar leída usa PK + LOGIN_SISTEMA en WHERE. */
IF OBJECT_ID(N'dbo.GEN_NOTIFICACION', N'U') IS NOT NULL
   AND NOT EXISTS (
     SELECT 1
     FROM sys.indexes
     WHERE name = N'IX_GEN_NOTIFICACION_EMPRESA_LOGIN_FECHA'
       AND object_id = OBJECT_ID(N'dbo.GEN_NOTIFICACION')
   )
BEGIN
  CREATE NONCLUSTERED INDEX [IX_GEN_NOTIFICACION_EMPRESA_LOGIN_FECHA]
    ON [dbo].[GEN_NOTIFICACION] ([CORR_EMPRESA], [LOGIN_SISTEMA], [FECHA_CREA] DESC)
    INCLUDE ([LEIDA], [TITULO], [URL_DESTINO], [CORR_NOTIFICACION]);
END
GO

/* Contador de no leídas (filtrado). No sustituye el índice de listado completo. */
IF OBJECT_ID(N'dbo.GEN_NOTIFICACION', N'U') IS NOT NULL
   AND NOT EXISTS (
     SELECT 1
     FROM sys.indexes
     WHERE name = N'IX_GEN_NOTIFICACION_EMPRESA_LOGIN_NOLEIDA'
       AND object_id = OBJECT_ID(N'dbo.GEN_NOTIFICACION')
   )
BEGIN
  CREATE NONCLUSTERED INDEX [IX_GEN_NOTIFICACION_EMPRESA_LOGIN_NOLEIDA]
    ON [dbo].[GEN_NOTIFICACION] ([CORR_EMPRESA], [LOGIN_SISTEMA], [FECHA_CREA] DESC)
    INCLUDE ([CORR_NOTIFICACION], [TITULO], [URL_DESTINO])
    WHERE ([LEIDA] = 0);
END
GO

/* ========== VISTA ========== */
CREATE OR ALTER VIEW [dbo].[V_GEN_NOTIFICACION]
AS
SELECT
    X.CORR_EMPRESA,
    X.CORR_NOTIFICACION,
    X.LOGIN_SISTEMA,
    X.TITULO,
    X.MENSAJE,
    X.URL_DESTINO,
    X.FECHA_CREA,
    X.LEIDA,
    X.FECHA_LECTURA,
    X.USUARIO_CREA,
    X.ESTACION_CREA,
    X.USUARIO_ACTU,
    X.ESTACION_ACTU,
    X.FECHA_ACTU
FROM dbo.GEN_NOTIFICACION AS X;
GO

PRINT N'GEN_NOTIFICACION / V_GEN_NOTIFICACION listos.';
GO
