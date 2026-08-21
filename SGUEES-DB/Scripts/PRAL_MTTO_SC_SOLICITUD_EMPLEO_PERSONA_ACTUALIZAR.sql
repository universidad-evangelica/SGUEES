SET NOCOUNT ON;
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

/*
  RRHH — actualizar datos del candidato desde sc-solicitud-empleo (atómico).
  - UPDATE SC_PERSONA_DATOS (NO toca Confirmación: DECLARA_VERDAD, AUTORIZA_VERIFICACION,
    FECHA_DECLARACION, FIRMA_ELECTRONICA).
  - Reemplaza colecciones vía XML (.nodes) — compatibility_level 100.
  - Formato XML: <rows><row ATTR="..." /></rows>

  Ejecutar: sqlcmd ... -f 65001 -i PRAL_MTTO_SC_SOLICITUD_EMPLEO_PERSONA_ACTUALIZAR.sql
*/

CREATE OR ALTER PROCEDURE dbo.PRAL_MTTO_SC_SOLICITUD_EMPLEO_PERSONA_ACTUALIZAR
    @CORR_EMPRESA int,
    @CORR_SOLICITUD_EMPLEO int,
    @CORR_PERSONA_DATOS int,
    @NOMBRE1 varchar(50),
    @NOMBRE2 varchar(50) = NULL,
    @APELLIDO1 varchar(50),
    @APELLIDO2 varchar(50) = NULL,
    @FECHA_NACIMIENTO date,
    @EDAD int,
    @ESTADO_CIVIL varchar(50) = NULL,
    @NACIONALIDAD varchar(100) = NULL,
    @CORREO varchar(254),
    @CELULAR varchar(25),
    @TELEFONO varchar(25) = NULL,
    @DIRECCION varchar(500),
    @DUI varchar(25),
    @PASAPORTE varchar(50) = NULL,
    @ISSS varchar(50) = NULL,
    @AFP varchar(50) = NULL,
    @NOMBRE_AFP varchar(100) = NULL,
    @LICENCIA varchar(50) = NULL,
    @PLAZA_SOLICITADA varchar(250) = NULL,
    @PRETENSION_SALARIAL int,
    @DISPONIBILIDAD varchar(100) = NULL,
    @RELIGION varchar(100) = NULL,
    @IGLESIA varchar(250) = NULL,
    @DIRECCION_IGLESIA varchar(500) = NULL,
    @ES_CONTRIBUYENTE_CCF bit,
    @ES_JUBILADO bit,
    @POSEE_DISCAPACIDAD bit,
    @TIPO_DISCAPACIDAD varchar(250) = NULL,
    @EMERGENCIA_NOMBRE varchar(150),
    @EMERGENCIA_PARENTESCO varchar(100) = NULL,
    @EMERGENCIA_TELEFONO varchar(25),
    @TIENE_FAMILIARES_UEES bit,
    @FOTO_URL varchar(500) = NULL,
    @USUARIO_AUDITORIA varchar(30),
    @ESTACION_AUDITORIA varchar(50),
    @FAMILIARES_DIRECTOS_XML nvarchar(max) = NULL,
    @HIJOS_XML nvarchar(max) = NULL,
    @ESTUDIOS_XML nvarchar(max) = NULL,
    @IDIOMAS_XML nvarchar(max) = NULL,
    @COMPETENCIAS_XML nvarchar(max) = NULL,
    @EXPERIENCIAS_XML nvarchar(max) = NULL,
    @FAMILIARES_UEES_XML nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @FECHA_AUDITORIA datetime = GETDATE(),
            @XML_FAMILIARES xml,
            @XML_HIJOS xml,
            @XML_ESTUDIOS xml,
            @XML_IDIOMAS xml,
            @XML_COMPETENCIAS xml,
            @XML_EXPERIENCIAS xml,
            @XML_FAMILIARES_UEES xml,
            @EXISTE bit = 0;

    BEGIN TRY
        BEGIN TRANSACTION;

        SET @XML_FAMILIARES = CAST(COALESCE(NULLIF(@FAMILIARES_DIRECTOS_XML, N''), N'<rows/>') AS xml);
        SET @XML_HIJOS = CAST(COALESCE(NULLIF(@HIJOS_XML, N''), N'<rows/>') AS xml);
        SET @XML_ESTUDIOS = CAST(COALESCE(NULLIF(@ESTUDIOS_XML, N''), N'<rows/>') AS xml);
        SET @XML_IDIOMAS = CAST(COALESCE(NULLIF(@IDIOMAS_XML, N''), N'<rows/>') AS xml);
        SET @XML_COMPETENCIAS = CAST(COALESCE(NULLIF(@COMPETENCIAS_XML, N''), N'<rows/>') AS xml);
        SET @XML_EXPERIENCIAS = CAST(COALESCE(NULLIF(@EXPERIENCIAS_XML, N''), N'<rows/>') AS xml);
        SET @XML_FAMILIARES_UEES = CAST(COALESCE(NULLIF(@FAMILIARES_UEES_XML, N''), N'<rows/>') AS xml);

        /* Solicitud activa y vinculada a la persona indicada. */
        SELECT @EXISTE = 1
        FROM dbo.SC_SOLICITUD_EMPLEO S WITH (UPDLOCK, HOLDLOCK)
        WHERE S.CORR_EMPRESA = @CORR_EMPRESA
          AND S.CORR_SOLICITUD_EMPLEO = @CORR_SOLICITUD_EMPLEO
          AND S.ACTIVO = 1
          AND S.CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;

        IF ISNULL(@EXISTE, 0) = 0
            THROW 50001, N'La solicitud o los datos de persona no son validos.', 1;

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.SC_PERSONA_DATOS WITH (UPDLOCK, HOLDLOCK)
            WHERE CORR_EMPRESA = @CORR_EMPRESA
              AND CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS
        )
            THROW 50001, N'La solicitud o los datos de persona no son validos.', 1;

        /* Confirmacion (declaraciones/firma) NO se modifica aqui. */
        UPDATE dbo.SC_PERSONA_DATOS
           SET NOMBRE1 = @NOMBRE1,
               NOMBRE2 = NULLIF(LTRIM(RTRIM(@NOMBRE2)), ''),
               APELLIDO1 = @APELLIDO1,
               APELLIDO2 = NULLIF(LTRIM(RTRIM(@APELLIDO2)), ''),
               FECHA_NACIMIENTO = @FECHA_NACIMIENTO,
               EDAD = ISNULL(@EDAD, 0),
               ESTADO_CIVIL = NULLIF(LTRIM(RTRIM(@ESTADO_CIVIL)), ''),
               NACIONALIDAD = NULLIF(LTRIM(RTRIM(@NACIONALIDAD)), ''),
               CORREO = @CORREO,
               CELULAR = @CELULAR,
               TELEFONO = NULLIF(LTRIM(RTRIM(@TELEFONO)), ''),
               DIRECCION = @DIRECCION,
               DUI = @DUI,
               PASAPORTE = NULLIF(LTRIM(RTRIM(@PASAPORTE)), ''),
               ISSS = NULLIF(LTRIM(RTRIM(@ISSS)), ''),
               AFP = NULLIF(LTRIM(RTRIM(@AFP)), ''),
               NOMBRE_AFP = NULLIF(LTRIM(RTRIM(@NOMBRE_AFP)), ''),
               LICENCIA = NULLIF(LTRIM(RTRIM(@LICENCIA)), ''),
               PLAZA_SOLICITADA = NULLIF(LTRIM(RTRIM(@PLAZA_SOLICITADA)), ''),
               PRETENSION_SALARIAL = ISNULL(@PRETENSION_SALARIAL, 0),
               DISPONIBILIDAD = NULLIF(LTRIM(RTRIM(@DISPONIBILIDAD)), ''),
               RELIGION = NULLIF(LTRIM(RTRIM(@RELIGION)), ''),
               IGLESIA = NULLIF(LTRIM(RTRIM(@IGLESIA)), ''),
               DIRECCION_IGLESIA = NULLIF(LTRIM(RTRIM(@DIRECCION_IGLESIA)), ''),
               ES_CONTRIBUYENTE_CCF = ISNULL(@ES_CONTRIBUYENTE_CCF, 0),
               ES_JUBILADO = ISNULL(@ES_JUBILADO, 0),
               POSEE_DISCAPACIDAD = ISNULL(@POSEE_DISCAPACIDAD, 0),
               TIPO_DISCAPACIDAD = NULLIF(LTRIM(RTRIM(@TIPO_DISCAPACIDAD)), ''),
               EMERGENCIA_NOMBRE = @EMERGENCIA_NOMBRE,
               EMERGENCIA_PARENTESCO = NULLIF(LTRIM(RTRIM(@EMERGENCIA_PARENTESCO)), ''),
               EMERGENCIA_TELEFONO = @EMERGENCIA_TELEFONO,
               TIENE_FAMILIARES_UEES = ISNULL(@TIENE_FAMILIARES_UEES, 0),
               FOTO_URL = COALESCE(NULLIF(LTRIM(RTRIM(@FOTO_URL)), ''), FOTO_URL),
               USUARIO_ACTU = @USUARIO_AUDITORIA,
               ESTACION_ACTU = @ESTACION_AUDITORIA,
               FECHA_ACTU = @FECHA_AUDITORIA
         WHERE CORR_EMPRESA = @CORR_EMPRESA
           AND CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;

        DELETE FROM dbo.SC_PERSONA_FAMILIAR
         WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;
        DELETE FROM dbo.SC_PERSONA_HIJOS
         WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;
        DELETE FROM dbo.SC_PERSONA_ESTUDIO
         WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;
        DELETE FROM dbo.SC_PERSONA_IDIOMAS
         WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;
        DELETE FROM dbo.SC_PERSONA_COMPETENCIAS_TECNICAS
         WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;
        DELETE FROM dbo.SC_PERSONA_EXPERIENCIA_LABORAL
         WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;
        DELETE FROM dbo.SC_PERSONA_FAMILIAR_UEES
         WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;

        INSERT INTO dbo.SC_PERSONA_FAMILIAR (
            CORR_EMPRESA, CORR_PERSONA_DATOS, CORR_FAMILIAR, TIPO, NOMBRE,
            DOMICILIO, FECHA_NACIMIENTO, OCUPACION,
            USUARIO_CREA, ESTACION_CREA, FECHA_CREA, USUARIO_ACTU, ESTACION_ACTU, FECHA_ACTU
        )
        SELECT @CORR_EMPRESA, @CORR_PERSONA_DATOS,
               ROW_NUMBER() OVER (ORDER BY (SELECT NULL)),
               NULLIF(LTRIM(RTRIM(T.X.value('@TIPO', 'varchar(50)'))), ''),
               NULLIF(LTRIM(RTRIM(T.X.value('@NOMBRE', 'varchar(150)'))), ''),
               NULLIF(LTRIM(RTRIM(T.X.value('@DOMICILIO', 'varchar(500)'))), ''),
               T.X.value('@FECHA_NACIMIENTO', 'date'),
               NULLIF(LTRIM(RTRIM(T.X.value('@OCUPACION', 'varchar(150)'))), ''),
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA,
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA
        FROM @XML_FAMILIARES.nodes('/rows/row') AS T(X)
        WHERE NULLIF(LTRIM(RTRIM(T.X.value('@NOMBRE', 'varchar(150)'))), '') IS NOT NULL
           OR NULLIF(LTRIM(RTRIM(T.X.value('@DOMICILIO', 'varchar(500)'))), '') IS NOT NULL
           OR T.X.value('@FECHA_NACIMIENTO', 'date') IS NOT NULL
           OR NULLIF(LTRIM(RTRIM(T.X.value('@OCUPACION', 'varchar(150)'))), '') IS NOT NULL;

        INSERT INTO dbo.SC_PERSONA_HIJOS (
            CORR_EMPRESA, CORR_PERSONA_DATOS, CORR_HIJO, NOMBRE, EDAD, SEXO,
            FECHA_NACIMIENTO,
            USUARIO_CREA, ESTACION_CREA, FECHA_CREA, USUARIO_ACTU, ESTACION_ACTU, FECHA_ACTU
        )
        SELECT @CORR_EMPRESA, @CORR_PERSONA_DATOS,
               ROW_NUMBER() OVER (ORDER BY (SELECT NULL)),
               NULLIF(LTRIM(RTRIM(T.X.value('@NOMBRE', 'varchar(150)'))), ''),
               T.X.value('@EDAD', 'int'),
               NULLIF(LTRIM(RTRIM(T.X.value('@SEXO', 'varchar(25)'))), ''),
               T.X.value('@FECHA_NACIMIENTO', 'date'),
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA,
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA
        FROM @XML_HIJOS.nodes('/rows/row') AS T(X)
        WHERE NULLIF(LTRIM(RTRIM(T.X.value('@NOMBRE', 'varchar(150)'))), '') IS NOT NULL;

        INSERT INTO dbo.SC_PERSONA_ESTUDIO (
            CORR_EMPRESA, CORR_PERSONA_DATOS, CORR_ESTUDIO, NIVEL, INSTITUCION,
            DESDE, HASTA, TITULO,
            USUARIO_CREA, ESTACION_CREA, FECHA_CREA, USUARIO_ACTU, ESTACION_ACTU, FECHA_ACTU
        )
        SELECT @CORR_EMPRESA, @CORR_PERSONA_DATOS,
               ROW_NUMBER() OVER (ORDER BY (SELECT NULL)),
               NULLIF(LTRIM(RTRIM(T.X.value('@NIVEL', 'varchar(100)'))), ''),
               NULLIF(LTRIM(RTRIM(T.X.value('@INSTITUCION', 'varchar(250)'))), ''),
               T.X.value('@DESDE', 'date'),
               T.X.value('@HASTA', 'date'),
               NULLIF(LTRIM(RTRIM(T.X.value('@TITULO', 'varchar(250)'))), ''),
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA,
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA
        FROM @XML_ESTUDIOS.nodes('/rows/row') AS T(X)
        WHERE NULLIF(LTRIM(RTRIM(T.X.value('@NIVEL', 'varchar(100)'))), '') IS NOT NULL
           OR NULLIF(LTRIM(RTRIM(T.X.value('@INSTITUCION', 'varchar(250)'))), '') IS NOT NULL
           OR NULLIF(LTRIM(RTRIM(T.X.value('@TITULO', 'varchar(250)'))), '') IS NOT NULL;

        INSERT INTO dbo.SC_PERSONA_IDIOMAS (
            CORR_EMPRESA, CORR_PERSONA_DATOS, CORR_IDIOMA, IDIOMA, NIVEL,
            USUARIO_CREA, ESTACION_CREA, FECHA_CREA, USUARIO_ACTU, ESTACION_ACTU, FECHA_ACTU
        )
        SELECT @CORR_EMPRESA, @CORR_PERSONA_DATOS,
               ROW_NUMBER() OVER (ORDER BY (SELECT NULL)),
               NULLIF(LTRIM(RTRIM(T.X.value('@IDIOMA', 'varchar(100)'))), ''),
               NULLIF(LTRIM(RTRIM(T.X.value('@NIVEL', 'varchar(100)'))), ''),
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA,
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA
        FROM @XML_IDIOMAS.nodes('/rows/row') AS T(X)
        WHERE NULLIF(LTRIM(RTRIM(T.X.value('@IDIOMA', 'varchar(100)'))), '') IS NOT NULL;

        INSERT INTO dbo.SC_PERSONA_COMPETENCIAS_TECNICAS (
            CORR_EMPRESA, CORR_PERSONA_DATOS, CORR_COMPETENCIA_TECNICA,
            HERRAMIENTA, NIVEL,
            USUARIO_CREA, ESTACION_CREA, FECHA_CREA, USUARIO_ACTU, ESTACION_ACTU, FECHA_ACTU
        )
        SELECT @CORR_EMPRESA, @CORR_PERSONA_DATOS,
               ROW_NUMBER() OVER (ORDER BY (SELECT NULL)),
               NULLIF(LTRIM(RTRIM(T.X.value('@HERRAMIENTA', 'varchar(150)'))), ''),
               NULLIF(LTRIM(RTRIM(T.X.value('@NIVEL', 'varchar(100)'))), ''),
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA,
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA
        FROM @XML_COMPETENCIAS.nodes('/rows/row') AS T(X)
        WHERE NULLIF(LTRIM(RTRIM(T.X.value('@HERRAMIENTA', 'varchar(150)'))), '') IS NOT NULL;

        INSERT INTO dbo.SC_PERSONA_EXPERIENCIA_LABORAL (
            CORR_EMPRESA, CORR_PERSONA_DATOS, CORR_EXPERIENCIA_LABORAL,
            EMPRESA, TELEFONO, CARGO, JEFE_INMEDIATO, FECHA_INICIO, FECHA_FIN,
            SALARIO_INICIAL, SALARIO_FINAL, MOTIVO_SALIDA,
            USUARIO_CREA, ESTACION_CREA, FECHA_CREA, USUARIO_ACTU, ESTACION_ACTU, FECHA_ACTU
        )
        SELECT @CORR_EMPRESA, @CORR_PERSONA_DATOS,
               ROW_NUMBER() OVER (ORDER BY (SELECT NULL)),
               NULLIF(LTRIM(RTRIM(T.X.value('@EMPRESA', 'varchar(250)'))), ''),
               NULLIF(LTRIM(RTRIM(T.X.value('@TELEFONO', 'varchar(25)'))), ''),
               NULLIF(LTRIM(RTRIM(T.X.value('@CARGO', 'varchar(150)'))), ''),
               NULLIF(LTRIM(RTRIM(T.X.value('@JEFE_INMEDIATO', 'varchar(150)'))), ''),
               T.X.value('@FECHA_INICIO', 'date'),
               T.X.value('@FECHA_FIN', 'date'),
               T.X.value('@SALARIO_INICIAL', 'decimal(18,2)'),
               T.X.value('@SALARIO_FINAL', 'decimal(18,2)'),
               NULLIF(LTRIM(RTRIM(T.X.value('@MOTIVO_SALIDA', 'varchar(500)'))), ''),
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA,
               @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA
        FROM @XML_EXPERIENCIAS.nodes('/rows/row') AS T(X)
        WHERE NULLIF(LTRIM(RTRIM(T.X.value('@EMPRESA', 'varchar(250)'))), '') IS NOT NULL
           OR NULLIF(LTRIM(RTRIM(T.X.value('@CARGO', 'varchar(150)'))), '') IS NOT NULL;

        IF ISNULL(@TIENE_FAMILIARES_UEES, 0) = 1
        BEGIN
            INSERT INTO dbo.SC_PERSONA_FAMILIAR_UEES (
                CORR_EMPRESA, CORR_PERSONA_DATOS, CORR_FAMILIAR_UEES,
                NOMBRE, PARENTESCO, UNIDAD, TELEFONO,
                USUARIO_CREA, ESTACION_CREA, FECHA_CREA, USUARIO_ACTU, ESTACION_ACTU, FECHA_ACTU
            )
            SELECT @CORR_EMPRESA, @CORR_PERSONA_DATOS,
                   ROW_NUMBER() OVER (ORDER BY (SELECT NULL)),
                   NULLIF(LTRIM(RTRIM(T.X.value('@NOMBRE', 'varchar(150)'))), ''),
                   NULLIF(LTRIM(RTRIM(T.X.value('@PARENTESCO', 'varchar(100)'))), ''),
                   NULLIF(LTRIM(RTRIM(T.X.value('@UNIDAD', 'varchar(150)'))), ''),
                   NULLIF(LTRIM(RTRIM(T.X.value('@TELEFONO', 'varchar(25)'))), ''),
                   @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA,
                   @USUARIO_AUDITORIA, @ESTACION_AUDITORIA, @FECHA_AUDITORIA
            FROM @XML_FAMILIARES_UEES.nodes('/rows/row') AS T(X)
            WHERE NULLIF(LTRIM(RTRIM(T.X.value('@NOMBRE', 'varchar(150)'))), '') IS NOT NULL;
        END;

        COMMIT TRANSACTION;

        SELECT @CORR_EMPRESA AS CORR_EMPRESA,
               @CORR_PERSONA_DATOS AS CORR_PERSONA_DATOS,
               CAST(1 AS bit) AS ACTUALIZADO;
    END TRY
    BEGIN CATCH
        DECLARE @NUMERO_ERROR int = ERROR_NUMBER(),
                @SEVERITY_ERROR int = ERROR_SEVERITY(),
                @ESTADO_ERROR int = ERROR_STATE(),
                @ORIGEN_ERROR nvarchar(126) = ERROR_PROCEDURE(),
                @LINEA_ERROR int = ERROR_LINE(),
                @MENSAJE_ERROR nvarchar(4000) = ERROR_MESSAGE(),
                @CORR_BITACORA numeric(38, 0) = 0;

        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        IF @NUMERO_ERROR <> 50001
        BEGIN
            EXEC dbo.PRAL_MTTO_ADMIN_BITACORA_SISTEMA
                1, @CORR_BITACORA OUTPUT, 'PM', @NUMERO_ERROR, @SEVERITY_ERROR,
                @ESTADO_ERROR, @ORIGEN_ERROR, @LINEA_ERROR, @MENSAJE_ERROR,
                @USUARIO_AUDITORIA, @FECHA_AUDITORIA, @ESTACION_AUDITORIA;
        END;

        THROW;
    END CATCH;
END;
GO
