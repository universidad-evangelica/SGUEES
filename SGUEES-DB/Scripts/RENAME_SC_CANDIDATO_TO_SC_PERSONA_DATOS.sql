SET NOCOUNT ON;
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

/* Renombra SC_CANDIDATO -> SC_PERSONA_DATOS sin cambiar columnas ni el flujo funcional. */

IF OBJECT_ID(N'dbo.SC_CANDIDATO', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.SC_PERSONA_DATOS', N'U') IS NULL
BEGIN
    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_SC_SOLICITUD_EMPLEO_SC_CANDIDATO'
    )
    BEGIN
        ALTER TABLE dbo.SC_SOLICITUD_EMPLEO
            DROP CONSTRAINT FK_SC_SOLICITUD_EMPLEO_SC_CANDIDATO;
    END;

    EXEC sys.sp_rename
        @objname = N'dbo.SC_CANDIDATO',
        @newname = N'SC_PERSONA_DATOS',
        @objtype = N'OBJECT';
END;
GO

IF OBJECT_ID(N'dbo.SC_PERSONA_DATOS', N'U') IS NOT NULL
BEGIN
    IF EXISTS (
        SELECT 1
        FROM sys.key_constraints
        WHERE name = N'PK_SC_CANDIDATO'
          AND parent_object_id = OBJECT_ID(N'dbo.SC_PERSONA_DATOS')
    )
    BEGIN
        EXEC sys.sp_rename
            @objname = N'dbo.PK_SC_CANDIDATO',
            @newname = N'PK_SC_PERSONA_DATOS',
            @objtype = N'OBJECT';
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.key_constraints
        WHERE name = N'PK_SC_PERSONA_DATOS'
          AND parent_object_id = OBJECT_ID(N'dbo.SC_PERSONA_DATOS')
    )
    BEGIN
        ALTER TABLE dbo.SC_PERSONA_DATOS
            ADD CONSTRAINT PK_SC_PERSONA_DATOS
            PRIMARY KEY CLUSTERED (CORR_EMPRESA, CORR_PERSONA_DATOS);
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_SC_SOLICITUD_EMPLEO_SC_PERSONA_DATOS'
    )
    BEGIN
        ALTER TABLE dbo.SC_SOLICITUD_EMPLEO WITH CHECK
            ADD CONSTRAINT FK_SC_SOLICITUD_EMPLEO_SC_PERSONA_DATOS
            FOREIGN KEY (CORR_EMPRESA, CORR_PERSONA_DATOS)
            REFERENCES dbo.SC_PERSONA_DATOS (CORR_EMPRESA, CORR_PERSONA_DATOS);
    END;
END;
GO
