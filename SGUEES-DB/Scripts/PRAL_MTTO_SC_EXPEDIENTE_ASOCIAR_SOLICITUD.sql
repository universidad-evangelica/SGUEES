SET NOCOUNT ON;
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

/*
  Consulta / asocia SC_SOLICITUD_EMPLEO ↔ SC_EXPEDIENTE_CANDIDATO.

  @SOLO_CONSULTA = 1 → solo valida y retorna estado (sin insertar).
  @SOLO_CONSULTA = 0 → asocia (crea encabezado si @CREAR_EXPEDIENTE = 1).

  Códigos @SYS_NUMERO_ERROR (mensajes SOLO aquí):
    0    = PUEDE_ASOCIAR (consulta) / asociada con éxito (acción)
    4101 = solicitud inválida / sin persona
    4102 = DUI de solicitud no coincide con DUI de persona
    4103 = no existe expediente; se requiere confirmar creación
    4104 = la solicitud ya está asociada a ese expediente
   -1    = error no controlado

  Ejecutar: sqlcmd ... -f 65001 -i PRAL_MTTO_SC_EXPEDIENTE_ASOCIAR_SOLICITUD.sql
*/
CREATE OR ALTER PROCEDURE dbo.PRAL_MTTO_SC_EXPEDIENTE_ASOCIAR_SOLICITUD
    @CORR_EMPRESA int,
    @CORR_SOLICITUD_EMPLEO int,
    @CREAR_EXPEDIENTE bit = 0,
    @SOLO_CONSULTA bit = 0,
    @SYS_LOGIN_USUARIO varchar(50) = NULL,
    @SYS_ESTACION varchar(50) = NULL,
    @CORR_EXPEDIENTE_CANDIDATO int = NULL OUTPUT,
    @ESTADO varchar(30) = NULL OUTPUT,
    @SYS_FILAS_AFECTADAS int = 0 OUTPUT,
    @SYS_NUMERO_ERROR int = 0 OUTPUT,
    @SYS_MENSAJE_ERROR nvarchar(4000) = N'' OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @CORR_PERSONA_DATOS int = 0,
        @DUI_SOLICITUD varchar(25) = NULL,
        @DUI_PERSONA varchar(25) = NULL,
        @DUI_SOL_NORM varchar(25) = NULL,
        @DUI_PER_NORM varchar(25) = NULL,
        @CORR_EXP int = 0,
        @CORR_DET int = 0,
        @FECHA datetime = GETDATE();

    SET @SYS_FILAS_AFECTADAS = 0;
    SET @SYS_NUMERO_ERROR = 0;
    SET @SYS_MENSAJE_ERROR = N'';
    SET @CORR_EXPEDIENTE_CANDIDATO = NULL;
    SET @ESTADO = NULL;

    BEGIN TRY
        IF ISNULL(@SOLO_CONSULTA, 0) = 0
            BEGIN TRANSACTION;

        IF ISNULL(@SOLO_CONSULTA, 0) = 1
        BEGIN
            SELECT
                @CORR_PERSONA_DATOS = ISNULL(S.CORR_PERSONA_DATOS, 0),
                @DUI_SOLICITUD = S.DUI
            FROM dbo.SC_SOLICITUD_EMPLEO AS S
            WHERE S.CORR_EMPRESA = @CORR_EMPRESA
              AND S.CORR_SOLICITUD_EMPLEO = @CORR_SOLICITUD_EMPLEO;
        END
        ELSE
        BEGIN
            SELECT
                @CORR_PERSONA_DATOS = ISNULL(S.CORR_PERSONA_DATOS, 0),
                @DUI_SOLICITUD = S.DUI
            FROM dbo.SC_SOLICITUD_EMPLEO AS S WITH (UPDLOCK, HOLDLOCK)
            WHERE S.CORR_EMPRESA = @CORR_EMPRESA
              AND S.CORR_SOLICITUD_EMPLEO = @CORR_SOLICITUD_EMPLEO;
        END;

        IF @@ROWCOUNT = 0 OR @CORR_PERSONA_DATOS <= 0
        BEGIN
            SET @ESTADO = N'SIN_PERSONA';
            SET @SYS_NUMERO_ERROR = 4101;
            SET @SYS_MENSAJE_ERROR = N'La solicitud no existe o no tiene persona asociada (CORR_PERSONA_DATOS).';
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            RETURN;
        END;

        SELECT @DUI_PERSONA = P.DUI
        FROM dbo.SC_PERSONA_DATOS AS P
        WHERE P.CORR_EMPRESA = @CORR_EMPRESA
          AND P.CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;

        IF @DUI_PERSONA IS NULL
        BEGIN
            SET @ESTADO = N'SIN_PERSONA';
            SET @SYS_NUMERO_ERROR = 4101;
            SET @SYS_MENSAJE_ERROR = N'No se encontraron los datos de persona de la solicitud.';
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            RETURN;
        END;

        SET @DUI_SOL_NORM = UPPER(REPLACE(REPLACE(LTRIM(RTRIM(ISNULL(@DUI_SOLICITUD, ''))), '-', ''), ' ', ''));
        SET @DUI_PER_NORM = UPPER(REPLACE(REPLACE(LTRIM(RTRIM(ISNULL(@DUI_PERSONA, ''))), '-', ''), ' ', ''));

        IF @DUI_SOL_NORM = N'' OR @DUI_PER_NORM = N'' OR @DUI_SOL_NORM <> @DUI_PER_NORM
        BEGIN
            SET @ESTADO = N'DUI_NO_COINCIDE';
            SET @SYS_NUMERO_ERROR = 4102;
            SET @SYS_MENSAJE_ERROR = N'El DUI de la solicitud no coincide con el DUI de la persona asociada.';
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            RETURN;
        END;

        IF ISNULL(@SOLO_CONSULTA, 0) = 1
        BEGIN
            SELECT @CORR_EXP = E.CORR_EXPEDIENTE_CANDIDATO
            FROM dbo.SC_EXPEDIENTE_CANDIDATO AS E
            WHERE E.CORR_EMPRESA = @CORR_EMPRESA
              AND E.CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;
        END
        ELSE
        BEGIN
            SELECT @CORR_EXP = E.CORR_EXPEDIENTE_CANDIDATO
            FROM dbo.SC_EXPEDIENTE_CANDIDATO AS E WITH (UPDLOCK, HOLDLOCK)
            WHERE E.CORR_EMPRESA = @CORR_EMPRESA
              AND E.CORR_PERSONA_DATOS = @CORR_PERSONA_DATOS;
        END;

        IF ISNULL(@CORR_EXP, 0) = 0
        BEGIN
            /* Consulta o asociar sin confirmar creación */
            IF ISNULL(@SOLO_CONSULTA, 0) = 1 OR ISNULL(@CREAR_EXPEDIENTE, 0) = 0
            BEGIN
                SET @ESTADO = N'SIN_EXPEDIENTE';
                SET @SYS_NUMERO_ERROR = 4103;
                SET @SYS_MENSAJE_ERROR = N'No existe un expediente para esta persona. ¿Desea crear el expediente y asociar la solicitud?';
                IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
                RETURN;
            END;

            SELECT @CORR_EXP = ISNULL(MAX(CORR_EXPEDIENTE_CANDIDATO), 0) + 1
            FROM dbo.SC_EXPEDIENTE_CANDIDATO WITH (UPDLOCK, HOLDLOCK)
            WHERE CORR_EMPRESA = @CORR_EMPRESA;

            INSERT INTO dbo.SC_EXPEDIENTE_CANDIDATO (
                CORR_EMPRESA, CORR_EXPEDIENTE_CANDIDATO, CORR_PERSONA_DATOS,
                FECHA_GENERACION, ACTIVO,
                USUARIO_CREA, ESTACION_CREA, FECHA_CREA,
                USUARIO_ACTU, ESTACION_ACTU, FECHA_ACTU
            )
            VALUES (
                @CORR_EMPRESA, @CORR_EXP, @CORR_PERSONA_DATOS,
                @FECHA, 1,
                @SYS_LOGIN_USUARIO, @SYS_ESTACION, @FECHA,
                @SYS_LOGIN_USUARIO, @SYS_ESTACION, @FECHA
            );

            SET @SYS_FILAS_AFECTADAS = @SYS_FILAS_AFECTADAS + 1;
        END;

        IF EXISTS (
            SELECT 1
            FROM dbo.SC_EXPEDIENTE_SOLICITUD AS X
            WHERE X.CORR_EMPRESA = @CORR_EMPRESA
              AND X.CORR_EXPEDIENTE_CANDIDATO = @CORR_EXP
              AND X.CORR_SOLICITUD_EMPLEO = @CORR_SOLICITUD_EMPLEO
        )
        BEGIN
            SET @CORR_EXPEDIENTE_CANDIDATO = @CORR_EXP;
            SET @ESTADO = N'YA_ASOCIADA';
            SET @SYS_NUMERO_ERROR = 4104;
            SET @SYS_MENSAJE_ERROR = N'La solicitud ya está asociada a este expediente de candidato.';
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            RETURN;
        END;

        /* Consulta: expediente existe y la solicitud aún no está asociada */
        IF ISNULL(@SOLO_CONSULTA, 0) = 1
        BEGIN
            SET @CORR_EXPEDIENTE_CANDIDATO = @CORR_EXP;
            SET @ESTADO = N'PUEDE_ASOCIAR';
            SET @SYS_NUMERO_ERROR = 0;
            SET @SYS_MENSAJE_ERROR = N'';
            RETURN;
        END;

        SELECT @CORR_DET = ISNULL(MAX(CORR_EXPEDIENTE_SOLICITUD), 0) + 1
        FROM dbo.SC_EXPEDIENTE_SOLICITUD WITH (UPDLOCK, HOLDLOCK)
        WHERE CORR_EMPRESA = @CORR_EMPRESA
          AND CORR_EXPEDIENTE_CANDIDATO = @CORR_EXP;

        INSERT INTO dbo.SC_EXPEDIENTE_SOLICITUD (
            CORR_EMPRESA, CORR_EXPEDIENTE_CANDIDATO, CORR_EXPEDIENTE_SOLICITUD,
            CORR_SOLICITUD_EMPLEO,
            USUARIO_CREA, ESTACION_CREA, FECHA_CREA,
            USUARIO_ACTU, ESTACION_ACTU, FECHA_ACTU
        )
        VALUES (
            @CORR_EMPRESA, @CORR_EXP, @CORR_DET,
            @CORR_SOLICITUD_EMPLEO,
            @SYS_LOGIN_USUARIO, @SYS_ESTACION, @FECHA,
            @SYS_LOGIN_USUARIO, @SYS_ESTACION, @FECHA
        );

        SET @SYS_FILAS_AFECTADAS = @SYS_FILAS_AFECTADAS + 1;
        SET @CORR_EXPEDIENTE_CANDIDATO = @CORR_EXP;
        SET @ESTADO = N'ASOCIADA';
        SET @SYS_NUMERO_ERROR = 0;
        SET @SYS_MENSAJE_ERROR = N'Solicitud asociada al expediente correctamente.';

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @ESTADO = N'ERROR';
        SET @SYS_NUMERO_ERROR = -1;
        SET @SYS_MENSAJE_ERROR = ERROR_MESSAGE();
        SET @SYS_FILAS_AFECTADAS = 0;
        SET @CORR_EXPEDIENTE_CANDIDATO = NULL;
    END CATCH
END;
GO
