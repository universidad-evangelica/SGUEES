-- =============================================
-- CAMBIOS REQUERIDOS EN BASE DE DATOS
-- Sistema de Expiración de Contraseñas
-- Fecha: 03 de febrero de 2026
-- =============================================

-- ===========================================================
-- PASO 1: Crear tabla SEG_PARAMETRO (si no existe)
-- ===========================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SEG_PARAMETRO')
BEGIN
    CREATE TABLE [dbo].[SEG_PARAMETRO](
        [CORR_EMPRESA] [INT] NOT NULL,
        [CANTIDAD_MESES_EXPIRA_CONTRASENA] [INT] NULL,
     CONSTRAINT [PK_SEG_PARAMETRO] PRIMARY KEY CLUSTERED 
    (
        [CORR_EMPRESA] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    ) ON [PRIMARY]
    
    PRINT '✓ Tabla SEG_PARAMETRO creada'
END
ELSE
BEGIN
    PRINT '✓ Tabla SEG_PARAMETRO ya existe'
END
GO

-- ===========================================================
-- PASO 2: Agregar columna FECHA_CAMBIO_CLAVE a SEG_USUARIO
-- ===========================================================

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SEG_USUARIO') AND name = 'FECHA_CAMBIO_CLAVE')
BEGIN
    ALTER TABLE [dbo].[SEG_USUARIO]
    ADD [FECHA_CAMBIO_CLAVE] DATETIME NULL
    
    -- Inicializar con fecha de creación para usuarios existentes
    UPDATE SEG_USUARIO
    SET FECHA_CAMBIO_CLAVE = FECHA_CREACION
    WHERE FECHA_CAMBIO_CLAVE IS NULL
    
    PRINT '✓ Columna FECHA_CAMBIO_CLAVE agregada a SEG_USUARIO'
END
ELSE
BEGIN
    PRINT '✓ Columna FECHA_CAMBIO_CLAVE ya existe en SEG_USUARIO'
END
GO

-- ===========================================================
-- PASO 3: Insertar configuración inicial en SEG_PARAMETRO
-- ===========================================================

-- Insertar para cada empresa existente (si no existe ya)
INSERT INTO SEG_PARAMETRO (CORR_EMPRESA, CANTIDAD_MESES_EXPIRA_CONTRASENA)
SELECT DISTINCT CORR_EMPRESA, 6
FROM SEG_USUARIO u
WHERE NOT EXISTS (
    SELECT 1 FROM SEG_PARAMETRO p WHERE p.CORR_EMPRESA = u.CORR_EMPRESA
)

PRINT '✓ Configuración inicial insertada en SEG_PARAMETRO'
GO

-- ===========================================================
-- PASO 4: Actualizar SP PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE
-- ===========================================================

-- IMPORTANTE: Verificar que el UPDATE en este SP incluya:
--   FECHA_CAMBIO_CLAVE = GETDATE()
--   FLAG_PRIMER_LOGIN = 0

-- Consultar el SP actual:
EXEC sp_helptext 'PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE'
GO

-- El UPDATE debe verse así (LÍNEAS 26-32):
/*
UPDATE SEG_USUARIO SET 
    CLAVE_USUARIO=@CLAVE_USUARIO,
    CLAVE_USUARIO_SAL=@CLAVE_USUARIO_SAL,
    USUARIO_ACTU=@USUARIO_ACTU,
    FECHA_ACTU=@FECHA_ACTU,
    ESTACION_ACTU=@ESTACION_ACTU,
    FECHA_CAMBIO_CLAVE=GETDATE(),      <-- IMPORTANTE
    FLAG_PRIMER_LOGIN=0                 <-- IMPORTANTE
WHERE LOGIN_SISTEMA=@LOGIN_SISTEMA
*/

-- ===========================================================
-- PASO 5: Crear o reemplazar SP de validación de expiración
-- ===========================================================

-- Ejecutar el archivo: SGUEES-DB/Stored Procedures/PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE.sql

-- Este SP debe existir y retornar:
--   LOGIN_SISTEMA, REQUIERE_CAMBIO_CLAVE, FECHA_ULTIMO_CAMBIO, 
--   FECHA_EXPIRACION, DIAS_PARA_EXPIRAR, MESES_VIGENCIA, MENSAJE

-- ===========================================================
-- PASO 6: Verificar integridad de datos
-- ===========================================================

PRINT ''
PRINT '========== VERIFICACIÓN FINAL =========='
PRINT ''

-- Verificar tabla SEG_PARAMETRO
SELECT 'SEG_PARAMETRO' AS Tabla, COUNT(*) AS Registros FROM SEG_PARAMETRO
PRINT '✓ Tabla SEG_PARAMETRO verificada'
GO

-- Verificar columna FECHA_CAMBIO_CLAVE
SELECT 
    COUNT(*) AS Total_Usuarios,
    SUM(CASE WHEN FECHA_CAMBIO_CLAVE IS NOT NULL THEN 1 ELSE 0 END) AS Con_Fecha_Cambio
FROM SEG_USUARIO
PRINT '✓ Columna FECHA_CAMBIO_CLAVE verificada en SEG_USUARIO'
GO

-- Verificar SP de expiración
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE')
BEGIN
    PRINT '✓ SP PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE existe'
END
ELSE
BEGIN
    PRINT '✗ FALTA: SP PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE'
END
GO

-- ===========================================================
-- PASO 7: Prueba rápida del sistema (OPCIONAL)
-- ===========================================================

/*
-- Para probar, ejecutar:

-- 1. Validar expiración de un usuario
EXEC PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE @LOGIN_SISTEMA = 'usuario.ejemplo'

-- 2. Ver resultado (debería mostrar dias para expirar, si está configurado)
SELECT 
    u.LOGIN_SISTEMA,
    u.NOMBRE_COMPLETO,
    u.FECHA_CAMBIO_CLAVE,
    p.CANTIDA_MESES_EXPIRA_CONTRASEÑA,
    DATEDIFF(DAY, GETDATE(), DATEADD(MONTH, p.CANTIDA_MESES_EXPIRA_CONTRASEÑA, u.FECHA_CAMBIO_CLAVE)) AS DIAS_PARA_EXPIRAR
FROM SEG_USUARIO u
INNER JOIN SEG_PARAMETRO p ON u.CORR_EMPRESA = p.CORR_EMPRESA
WHERE u.LOGIN_SISTEMA = 'usuario.ejemplo'

-- 3. Ver configuración de su empresa
SELECT * FROM SEG_PARAMETRO WHERE CORR_EMPRESA = (SELECT CORR_EMPRESA FROM SEG_USUARIO WHERE LOGIN_SISTEMA = 'usuario.ejemplo')
*/

PRINT ''
PRINT '========== FIN DE CAMBIOS =========='
PRINT ''
PRINT 'Próximos pasos:'
PRINT '1. Ejecutar este script en la base de datos'
PRINT '2. Verificar que todos los pasos se completen sin errores'
PRINT '3. Compilar y desplegar la aplicación C#'
PRINT '4. Probar el login con un usuario para validar la expiración'
PRINT ''
