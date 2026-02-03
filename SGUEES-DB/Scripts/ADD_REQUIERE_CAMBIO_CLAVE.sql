-- Script para agregar campo de cambio obligatorio de contraseña
-- Ejecutar en la base de datos SGUEES

-- 1. Agregar columna REQUIERE_CAMBIO_CLAVE a SEG_USUARIO
IF NOT EXISTS (SELECT 1 FROM sys.columns 
               WHERE object_id = OBJECT_ID('dbo.SEG_USUARIO') 
               AND name = 'REQUIERE_CAMBIO_CLAVE')
BEGIN
    ALTER TABLE [dbo].[SEG_USUARIO]
    ADD [REQUIERE_CAMBIO_CLAVE] [bit] NOT NULL DEFAULT 0;
    
    PRINT 'Campo REQUIERE_CAMBIO_CLAVE agregado exitosamente';
END
ELSE
BEGIN
    PRINT 'El campo REQUIERE_CAMBIO_CLAVE ya existe';
END
GO

-- 2. Actualizar usuarios existentes para que NO requieran cambio (opcional)
UPDATE [dbo].[SEG_USUARIO]
SET [REQUIERE_CAMBIO_CLAVE] = 0
WHERE [REQUIERE_CAMBIO_CLAVE] IS NULL;
GO

PRINT 'Script ejecutado correctamente';
