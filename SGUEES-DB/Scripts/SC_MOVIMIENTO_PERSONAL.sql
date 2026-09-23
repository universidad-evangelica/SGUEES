/* =============================================================================
   SC_MOVIMIENTO_PERSONAL — tabla + vista
   Pantalla: /sc-movimiento-personal

   Alcance actual:
   - Encabezado del movimiento (origen DIRECTO / REQUISICION).
   - Comparativo posición actual vs propuesta.
   - Estados: DI / SO / OB / AP / DE / AN.
   - Sin vínculos a requisición/empleado/persona (se agregarán después).

   Ejecutar:
     sqlcmd -S <servidor> -d SGUEES -U <user> -P <pass> -f 65001 -i SC_MOVIMIENTO_PERSONAL.sql
   ============================================================================= */
SET NOCOUNT ON;
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

IF OBJECT_ID(N'dbo.SC_MOVIMIENTO_PERSONAL', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SC_MOVIMIENTO_PERSONAL
    (
        CORR_EMPRESA                 INT             NOT NULL,
        CORR_MOVIMIENTO_PERSONAL     INT             NOT NULL,

        /* Encabezado */
        FECHA_ELABORACION            DATE            NOT NULL,
        ORIGEN_MOVIMIENTO            VARCHAR(20)     NOT NULL,  /* DIRECTO | REQUISICION */
        TIPO_MOVIMIENTO              VARCHAR(20)     NOT NULL,  /* PERMANENTE | EVENTUAL | ASCENSO | TRASLADO */
        ESTADO_MOVIMIENTO            VARCHAR(2)      NOT NULL,  /* DI SO OB AP DE AN */

        /* Persona (snapshot; CORR_EMPLEADO solo referencia, sin FK) */
        CORR_EMPLEADO                INT             NULL,
        NOMBRE_COMPLETO              NVARCHAR(250)   NOT NULL,
        NUMERO_ID                    NVARCHAR(50)    NULL,
        FECHA_INGRESO_PROPUESTA      DATE            NULL,
        FECHA_FINALIZACION           DATE            NULL,

        /* Posición actual (CORR + texto snapshot) */
        GERENCIA_ACTUAL              NVARCHAR(200)   NULL,
        CORR_UNIDAD_ACTUAL           INT             NULL,
        NOMBRE_UNIDAD_ACTUAL         NVARCHAR(150)   NULL,  /* CODIGO - NOMBRE */
        CORR_PUESTO_ACTUAL           INT             NULL,
        NOMBRE_PUESTO_ACTUAL         NVARCHAR(200)   NULL,
        SALARIO_ACTUAL               DECIMAL(18, 2)  NULL,
        CORR_TIPO_MODALIDAD_ACTUAL   INT             NULL,
        NOMBRE_MODALIDAD_ACTUAL      NVARCHAR(100)   NULL,
        HORARIO_ACTUAL               NVARCHAR(250)   NULL,

        /* Posición propuesta (CORR + texto snapshot) */
        GERENCIA_PROPUESTA           NVARCHAR(200)   NULL,
        CORR_UNIDAD_PROPUESTA        INT             NULL,
        NOMBRE_UNIDAD_PROPUESTA      NVARCHAR(150)   NULL,
        CORR_PUESTO_PROPUESTO        INT             NULL,
        NOMBRE_PUESTO_PROPUESTO      NVARCHAR(200)   NULL,
        SALARIO_PROPUESTO            DECIMAL(18, 2)  NULL,
        CORR_TIPO_MODALIDAD_PROPUESTA INT            NULL,
        NOMBRE_MODALIDAD_PROPUESTA   NVARCHAR(100)   NULL,
        HORARIO_PROPUESTO            NVARCHAR(250)   NULL,

        JUSTIFICACION                NVARCHAR(1000)  NULL,
        FECHA_EFECTIVA               DATE            NULL,

        /* Confirmación TH (independiente del flujo de aprobación) */
        CONFIRMADO                   BIT             NOT NULL
            CONSTRAINT DF_SC_MOVIMIENTO_PERSONAL_CONFIRMADO DEFAULT (0),
        USUARIO_CONFIRMA             VARCHAR(50)     NULL,  /* LOGIN_SISTEMA */
        FECHA_CONFIRMA               DATETIME        NULL,

        /* Auditoría */
        USUARIO_CREA                 VARCHAR(50)     NULL,
        ESTACION_CREA                VARCHAR(50)     NULL,
        FECHA_CREA                   DATETIME        NULL,
        USUARIO_ACTU                 VARCHAR(50)     NULL,
        ESTACION_ACTU                VARCHAR(50)     NULL,
        FECHA_ACTU                   DATETIME        NULL,

        CONSTRAINT PK_SC_MOVIMIENTO_PERSONAL
            PRIMARY KEY CLUSTERED (CORR_EMPRESA, CORR_MOVIMIENTO_PERSONAL),

        CONSTRAINT CK_SC_MOV_ORIGEN
            CHECK (ORIGEN_MOVIMIENTO IN ('DIRECTO', 'REQUISICION')),

        CONSTRAINT CK_SC_MOV_TIPO
            CHECK (TIPO_MOVIMIENTO IN ('PERMANENTE', 'EVENTUAL', 'ASCENSO', 'TRASLADO')),

        CONSTRAINT CK_SC_MOV_ESTADO
            CHECK (ESTADO_MOVIMIENTO IN ('DI', 'SO', 'OB', 'AP', 'DE', 'AN'))
    );
END;
GO

CREATE OR ALTER VIEW dbo.V_SC_MOVIMIENTO_PERSONAL
AS
SELECT
    M.CORR_EMPRESA,
    M.CORR_MOVIMIENTO_PERSONAL,
    M.FECHA_ELABORACION,
    M.ORIGEN_MOVIMIENTO,
    M.TIPO_MOVIMIENTO,
    M.ESTADO_MOVIMIENTO,
    CAST(CASE M.ESTADO_MOVIMIENTO
        WHEN 'DI' THEN N'Borrador'
        WHEN 'SO' THEN N'Solicitado'
        WHEN 'OB' THEN N'Devuelto'
        WHEN 'AP' THEN N'Aprobado'
        WHEN 'DE' THEN N'Denegado'
        WHEN 'AN' THEN N'Anulado'
        ELSE M.ESTADO_MOVIMIENTO
    END AS NVARCHAR(40)) AS NOMBRE_ESTADO_MOVIMIENTO,
    CAST(CASE M.TIPO_MOVIMIENTO
        WHEN 'PERMANENTE' THEN N'Contratación permanente'
        WHEN 'EVENTUAL' THEN N'Contratación eventual'
        WHEN 'ASCENSO' THEN N'Ascenso'
        WHEN 'TRASLADO' THEN N'Traslado'
        ELSE M.TIPO_MOVIMIENTO
    END AS NVARCHAR(60)) AS NOMBRE_TIPO_MOVIMIENTO,
    CAST(CASE M.ORIGEN_MOVIMIENTO
        WHEN 'DIRECTO' THEN N'Desde cero'
        WHEN 'REQUISICION' THEN N'Desde requisición'
        ELSE M.ORIGEN_MOVIMIENTO
    END AS NVARCHAR(40)) AS NOMBRE_ORIGEN_MOVIMIENTO,
    M.CORR_EMPLEADO,
    M.NOMBRE_COMPLETO,
    M.NUMERO_ID,
    M.FECHA_INGRESO_PROPUESTA,
    M.FECHA_FINALIZACION,
    M.GERENCIA_ACTUAL,
    M.CORR_UNIDAD_ACTUAL,
    M.NOMBRE_UNIDAD_ACTUAL,
    M.CORR_PUESTO_ACTUAL,
    M.NOMBRE_PUESTO_ACTUAL,
    M.SALARIO_ACTUAL,
    M.CORR_TIPO_MODALIDAD_ACTUAL,
    M.NOMBRE_MODALIDAD_ACTUAL,
    M.HORARIO_ACTUAL,
    M.GERENCIA_PROPUESTA,
    M.CORR_UNIDAD_PROPUESTA,
    M.NOMBRE_UNIDAD_PROPUESTA,
    M.CORR_PUESTO_PROPUESTO,
    M.NOMBRE_PUESTO_PROPUESTO,
    M.SALARIO_PROPUESTO,
    M.CORR_TIPO_MODALIDAD_PROPUESTA,
    M.NOMBRE_MODALIDAD_PROPUESTA,
    M.HORARIO_PROPUESTO,
    M.JUSTIFICACION,
    M.FECHA_EFECTIVA,
    M.CONFIRMADO,
    CAST(CASE WHEN ISNULL(M.CONFIRMADO, 0) = 1 THEN N'Confirmado' ELSE N'En Evaluación' END AS NVARCHAR(40))
        AS NOMBRE_CONFIRMACION,
    M.USUARIO_CONFIRMA,
    M.FECHA_CONFIRMA,
    M.USUARIO_CREA,
    M.ESTACION_CREA,
    M.FECHA_CREA,
    M.USUARIO_ACTU,
    M.ESTACION_ACTU,
    M.FECHA_ACTU
FROM dbo.SC_MOVIMIENTO_PERSONAL AS M;
GO

PRINT N'OK: SC_MOVIMIENTO_PERSONAL + V_SC_MOVIMIENTO_PERSONAL.';
GO
