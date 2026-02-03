-- =============================================
-- Autor: Sistema SGUEES
-- Fecha de creación: 2026-02-03
-- Descripción: Valida si la contraseña de un usuario ha expirado
-- basándose en los parámetros de la tabla SEG_PARAMETRO
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE]
    @LOGIN_SISTEMA NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @FECHA_ULTIMO_CAMBIO DATETIME
    DECLARE @FECHA_EXPIRACION DATETIME
    DECLARE @DIAS_PARA_EXPIRAR INT
    DECLARE @MESES_VIGENCIA INT
    DECLARE @REQUIERE_CAMBIO_CLAVE BIT
    DECLARE @MENSAJE NVARCHAR(500)
    DECLARE @CORR_EMPRESA INT
    
    -- Obtener la empresa del usuario
    SELECT @CORR_EMPRESA = CORR_EMPRESA,
           @FECHA_ULTIMO_CAMBIO = FECHA_CAMBIO_CLAVE
    FROM SEG_USUARIO
    WHERE LOGIN_SISTEMA = @LOGIN_SISTEMA
    
    -- Si no se encuentra el usuario, retornar valores por defecto
    IF @CORR_EMPRESA IS NULL
    BEGIN
        SELECT 
            @LOGIN_SISTEMA AS LOGIN_SISTEMA,
            CAST(0 AS BIT) AS REQUIERE_CAMBIO_CLAVE,
            NULL AS FECHA_ULTIMO_CAMBIO,
            NULL AS FECHA_EXPIRACION,
            NULL AS DIAS_PARA_EXPIRAR,
            0 AS MESES_VIGENCIA,
            'Usuario no encontrado' AS MENSAJE
        RETURN
    END
    
    -- Obtener los meses de vigencia desde SEG_PARAMETRO
    SELECT @MESES_VIGENCIA = ISNULL(CANTIDAD_MESES_EXPIRA_CONTRASENA, 0)
    FROM SEG_PARAMETRO
    WHERE CORR_EMPRESA = @CORR_EMPRESA
    
    -- Si no hay configuración o está en 0, no expira
    IF @MESES_VIGENCIA IS NULL OR @MESES_VIGENCIA = 0
    BEGIN
        SELECT 
            @LOGIN_SISTEMA AS LOGIN_SISTEMA,
            CAST(0 AS BIT) AS REQUIERE_CAMBIO_CLAVE,
            @FECHA_ULTIMO_CAMBIO AS FECHA_ULTIMO_CAMBIO,
            NULL AS FECHA_EXPIRACION,
            NULL AS DIAS_PARA_EXPIRAR,
            0 AS MESES_VIGENCIA,
            'La contraseña no tiene fecha de expiración configurada' AS MENSAJE
        RETURN
    END
    
    -- Si nunca ha cambiado la contraseña, usar la fecha de creación del usuario
    IF @FECHA_ULTIMO_CAMBIO IS NULL
    BEGIN
        SELECT @FECHA_ULTIMO_CAMBIO = FECHA_CREACION
        FROM SEG_USUARIO
        WHERE LOGIN_SISTEMA = @LOGIN_SISTEMA
    END
    
    -- Calcular la fecha de expiración (sumando los meses a la fecha del último cambio)
    SET @FECHA_EXPIRACION = DATEADD(MONTH, @MESES_VIGENCIA, @FECHA_ULTIMO_CAMBIO)
    
    -- Calcular los días que faltan para la expiración
    SET @DIAS_PARA_EXPIRAR = DATEDIFF(DAY, GETDATE(), @FECHA_EXPIRACION)
    
    -- Determinar si requiere cambio de clave
    IF @DIAS_PARA_EXPIRAR <= 0
    BEGIN
        SET @REQUIERE_CAMBIO_CLAVE = 1
        SET @MENSAJE = 'Su contraseña ha expirado. Debe cambiarla para continuar.'
    END
    ELSE IF @DIAS_PARA_EXPIRAR <= 7
    BEGIN
        SET @REQUIERE_CAMBIO_CLAVE = 0
        SET @MENSAJE = 'Su contraseña expirará en ' + CAST(@DIAS_PARA_EXPIRAR AS NVARCHAR(10)) + ' día(s).'
    END
    ELSE
    BEGIN
        SET @REQUIERE_CAMBIO_CLAVE = 0
        SET @MENSAJE = 'Su contraseña está vigente.'
    END
    
    -- Retornar el resultado
    SELECT 
        @LOGIN_SISTEMA AS LOGIN_SISTEMA,
        @REQUIERE_CAMBIO_CLAVE AS REQUIERE_CAMBIO_CLAVE,
        @FECHA_ULTIMO_CAMBIO AS FECHA_ULTIMO_CAMBIO,
        @FECHA_EXPIRACION AS FECHA_EXPIRACION,
        @DIAS_PARA_EXPIRAR AS DIAS_PARA_EXPIRAR,
        @MESES_VIGENCIA AS MESES_VIGENCIA,
        @MENSAJE AS MENSAJE
        
END
GO
