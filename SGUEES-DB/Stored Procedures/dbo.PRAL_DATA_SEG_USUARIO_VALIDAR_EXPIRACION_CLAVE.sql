SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO
-- =============================================
-- Procedimiento: PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE
-- Descripción: Valida si la contraseña del usuario ha expirado
-- Autor: Sistema
-- Fecha: 2026-01-30
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE]
(
    @LOGIN_SISTEMA VARCHAR(30)
)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MESES_VIGENCIA INT;
    DECLARE @FECHA_ULTIMO_CAMBIO DATETIME;
    DECLARE @FECHA_EXPIRACION DATETIME;
    DECLARE @DIAS_PARA_EXPIRAR INT;
    DECLARE @REQUIERE_CAMBIO_CLAVE BIT = 0;
    
    -- Obtener el parámetro de meses de vigencia
    SELECT @MESES_VIGENCIA = CAST(VALOR_PARAMETRO AS INT)
    FROM SEG_PARAMETRO
    WHERE CODIGO_PARAMETRO = 'CANTIDA_MESES_EXPIRA_CONTRASEÑA'
      AND ACTIVO = 1;
    
    -- Si el parámetro no existe o es 0, no se valida expiración
    IF @MESES_VIGENCIA IS NULL OR @MESES_VIGENCIA = 0
    BEGIN
        SELECT 
            LOGIN_SISTEMA = @LOGIN_SISTEMA,
            REQUIERE_CAMBIO_CLAVE = 0,
            FECHA_ULTIMO_CAMBIO = NULL,
            FECHA_EXPIRACION = NULL,
            DIAS_PARA_EXPIRAR = NULL,
            MESES_VIGENCIA = 0,
            MENSAJE = 'La validación de expiración de contraseña está desactivada';
        RETURN;
    END
    
    -- Buscar la fecha del último cambio de contraseña
    SELECT TOP 1 
        @FECHA_ULTIMO_CAMBIO = FECHA_LOGIN
    FROM SEG_USUARIO_LOGIN_HISTORIAL
    WHERE LOGIN_SISTEMA = @LOGIN_SISTEMA
      AND ES_CAMBIO_CLAVE = 1
      AND EXITOSO = 1
    ORDER BY FECHA_LOGIN DESC;
    
    -- Si no hay registro de cambio, verificar fecha de creación del usuario
    IF @FECHA_ULTIMO_CAMBIO IS NULL
    BEGIN
        SELECT @FECHA_ULTIMO_CAMBIO = FECHA_CREA
        FROM SEG_USUARIO
        WHERE LOGIN_SISTEMA = @LOGIN_SISTEMA;
    END
    
    -- Calcular fecha de expiración
    SET @FECHA_EXPIRACION = DATEADD(MONTH, @MESES_VIGENCIA, @FECHA_ULTIMO_CAMBIO);
    
    -- Calcular días para expirar
    SET @DIAS_PARA_EXPIRAR = DATEDIFF(DAY, GETDATE(), @FECHA_EXPIRACION);
    
    -- Determinar si requiere cambio
    IF @DIAS_PARA_EXPIRAR <= 0
    BEGIN
        SET @REQUIERE_CAMBIO_CLAVE = 1;
    END
    
    -- Retornar resultado
    SELECT 
        LOGIN_SISTEMA = @LOGIN_SISTEMA,
        REQUIERE_CAMBIO_CLAVE = @REQUIERE_CAMBIO_CLAVE,
        FECHA_ULTIMO_CAMBIO = @FECHA_ULTIMO_CAMBIO,
        FECHA_EXPIRACION = @FECHA_EXPIRACION,
        DIAS_PARA_EXPIRAR = @DIAS_PARA_EXPIRAR,
        MESES_VIGENCIA = @MESES_VIGENCIA,
        MENSAJE = CASE 
            WHEN @REQUIERE_CAMBIO_CLAVE = 1 THEN 'Su contraseña ha expirado. Debe cambiarla para continuar.'
            WHEN @DIAS_PARA_EXPIRAR <= 7 THEN 'Su contraseña expirará en ' + CAST(@DIAS_PARA_EXPIRAR AS VARCHAR) + ' días.'
            ELSE 'Su contraseña es válida.'
        END;
    
END
GO
