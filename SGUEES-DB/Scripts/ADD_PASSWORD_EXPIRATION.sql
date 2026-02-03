-- Script para agregar funcionalidad de expiración de contraseñas
-- Ejecutar en la base de datos SGUEES

USE SGUEES;
GO

-- =============================================
-- 1. Agregar campo ES_CAMBIO_CLAVE en SEG_USUARIO_LOGIN_HISTORIAL
-- =============================================
IF NOT EXISTS (SELECT 1 FROM sys.columns 
               WHERE object_id = OBJECT_ID('dbo.SEG_USUARIO_LOGIN_HISTORIAL') 
               AND name = 'ES_CAMBIO_CLAVE')
BEGIN
    ALTER TABLE dbo.SEG_USUARIO_LOGIN_HISTORIAL
    ADD ES_CAMBIO_CLAVE BIT NOT NULL DEFAULT 0;
    
    PRINT 'Campo ES_CAMBIO_CLAVE agregado a SEG_USUARIO_LOGIN_HISTORIAL';
END
ELSE
BEGIN
    PRINT 'El campo ES_CAMBIO_CLAVE ya existe en SEG_USUARIO_LOGIN_HISTORIAL';
END
GO

-- =============================================
-- 2. Crear tabla SEG_PARAMETRO si no existe
-- =============================================
IF NOT EXISTS (SELECT 1 FROM sys.objects 
               WHERE object_id = OBJECT_ID('dbo.SEG_PARAMETRO') 
               AND type = 'U')
BEGIN
    CREATE TABLE dbo.SEG_PARAMETRO
    (
        CODIGO_PARAMETRO VARCHAR(50) NOT NULL,
        NOMBRE_PARAMETRO VARCHAR(200) NOT NULL,
        VALOR_PARAMETRO VARCHAR(500) NULL,
        DESCRIPCION VARCHAR(1000) NULL,
        TIPO_DATO VARCHAR(20) NOT NULL DEFAULT 'STRING', -- STRING, INT, DECIMAL, BOOLEAN
        ACTIVO BIT NOT NULL DEFAULT 1,
        USUARIO_CREA VARCHAR(30) NULL,
        FECHA_CREA DATETIME NOT NULL DEFAULT GETDATE(),
        USUARIO_ACTU VARCHAR(30) NULL,
        FECHA_ACTU DATETIME NULL,
        CONSTRAINT PK_SEG_PARAMETRO PRIMARY KEY CLUSTERED (CODIGO_PARAMETRO)
    );
    
    PRINT 'Tabla SEG_PARAMETRO creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla SEG_PARAMETRO ya existe';
END
GO

-- =============================================
-- 3. Insertar parámetro de vigencia de contraseña
-- =============================================
IF NOT EXISTS (SELECT 1 FROM dbo.SEG_PARAMETRO 
               WHERE CODIGO_PARAMETRO = 'CANTIDA_MESES_EXPIRA_CONTRASEÑA')
BEGIN
    INSERT INTO dbo.SEG_PARAMETRO
    (CODIGO_PARAMETRO, NOMBRE_PARAMETRO, VALOR_PARAMETRO, DESCRIPCION, TIPO_DATO, ACTIVO, USUARIO_CREA, FECHA_CREA)
    VALUES
    ('CANTIDA_MESES_EXPIRA_CONTRASEÑA', 
     'Meses de vigencia de contraseña', 
     '3', 
     'Número de meses que debe pasar para que la contraseña expire y se obligue al usuario a cambiarla. Ejemplo: 3 = cada 3 meses, 6 = cada 6 meses, 0 = desactivar expiración',
     'INT',
     1,
     'SYSTEM',
     GETDATE());
    
    PRINT 'Parámetro CANTIDA_MESES_EXPIRA_CONTRASEÑA insertado con valor: 3 meses';
END
ELSE
BEGIN
    PRINT 'El parámetro CANTIDA_MESES_EXPIRA_CONTRASEÑA ya existe';
END
GO

-- =============================================
-- 4. Crear índice para búsqueda de cambios de clave
-- =============================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes 
               WHERE object_id = OBJECT_ID('dbo.SEG_USUARIO_LOGIN_HISTORIAL') 
               AND name = 'IX_SEG_USUARIO_LOGIN_HISTORIAL_CAMBIO_CLAVE')
BEGIN
    CREATE NONCLUSTERED INDEX IX_SEG_USUARIO_LOGIN_HISTORIAL_CAMBIO_CLAVE
    ON dbo.SEG_USUARIO_LOGIN_HISTORIAL (LOGIN_SISTEMA, ES_CAMBIO_CLAVE, FECHA_LOGIN DESC);
    
    PRINT 'Índice IX_SEG_USUARIO_LOGIN_HISTORIAL_CAMBIO_CLAVE creado';
END
ELSE
BEGIN
    PRINT 'El índice IX_SEG_USUARIO_LOGIN_HISTORIAL_CAMBIO_CLAVE ya existe';
END
GO

PRINT '';
PRINT '========================================';
PRINT 'Script ejecutado exitosamente';
PRINT '========================================';
PRINT 'Pasos siguientes:';
PRINT '1. Verificar el valor del parámetro CANTIDA_MESES_EXPIRA_CONTRASEÑA';
PRINT '2. Actualizar SP de cambio de clave para marcar ES_CAMBIO_CLAVE=1';
PRINT '3. Actualizar lógica de login para validar expiración';
PRINT '========================================';
GO
