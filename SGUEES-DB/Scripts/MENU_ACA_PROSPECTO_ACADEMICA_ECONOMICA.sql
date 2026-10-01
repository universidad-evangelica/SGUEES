-- ============================================================================================================
-- Qué hace: divide la opción "Prospectos" en dos vistas del mismo componente:
--   1. ACA_PROSPECTO           -> "Prospectos Académica"      /aca-prospecto-academico  (renombre de la actual)
--   2. ACA_PROSPECTO_ECONOMICO -> "Prospectos Socioeconómica" /aca-prospecto-economico  (nueva)
-- Cómo lo hace: usa PRAL_MTTO_CREAR_OPCION_MENU (transaccional). El renombre conserva el código de opción, así los
--               usuarios que ya tienen Prospectos conservan su acceso. La opción nueva solo se le asigna a quien
--               ejecuta (por ahora, para revisión). Actualiza también el favorito que apuntaba a la URL vieja.
-- IMPORTANTE:
--   * Publicar junto con el API y el SPA que usan las URL nuevas: con la URL renombrada, el API anterior (que
--     exige "/aca-prospecto") deja a todos sin acceso a Prospectos.
--   * Los permisos viajan en el token: cada usuario debe cerrar sesión y volver a entrar.
--   * Primero ejecutar con @SIMULAR = 1 y revisar; luego con @SIMULAR = 0.
-- Reversa: MENU_ACA_PROSPECTO_ACADEMICA_ECONOMICA_REVERSA.sql
-- ============================================================================================================
USE [SGUEES]
GO
SET NOCOUNT ON;

DECLARE @SIMULAR BIT = 0;                   -- 1 = solo valida y muestra; 0 = aplica
DECLARE @USUARIO VARCHAR(50) = 'emersont';  -- quien ejecuta y recibe la opción nueva

-- Permisos actuales del ejecutor sobre ACA_PROSPECTO: el SP los reescribe con @PERM_*, así que se pasan los mismos
-- para no cambiarlos al renombrar.
DECLARE @N BIT, @M BIT, @E BIT, @I BIT;
SELECT @N = NUEVO, @M = MODIFICAR, @E = ELIMINAR, @I = IMPRIMIR
FROM dbo.SEG_USUARIO_OPCION
WHERE LOGIN_SISTEMA = @USUARIO AND CODIGO_OPCION = 'ACA_PROSPECTO';
SELECT @N = ISNULL(@N, 0), @M = ISNULL(@M, 1), @E = ISNULL(@E, 0), @I = ISNULL(@I, 1);

PRINT '=== 1. Renombre de la opción actual (misma posición en el menú) ===';
EXEC dbo.PRAL_MTTO_CREAR_OPCION_MENU
    @CODIGO_OPCION    = 'ACA_PROSPECTO',
    @NOMBRE_OPCION    = 'Prospectos Académica',
    @URL_OPCION       = '/aca-prospecto-academico',
    @CODIGO_SISTEMA   = 'ACADEMICS',
    @CODIGO_MENU      = 'CONSULTA',
    @USUARIO_EJECUTOR = @USUARIO,
    @ORDEN_OPCION     = 1,
    @PERM_NUEVO       = @N,
    @PERM_MODIFICAR   = @M,
    @PERM_ELIMINAR    = @E,
    @PERM_IMPRIMIR    = @I,
    @ACTUALIZAR       = 1,
    @SIMULAR          = @SIMULAR;

PRINT '=== 2. Opción nueva, solo para el ejecutor (con los mismos permisos que tiene en la académica) ===';
EXEC dbo.PRAL_MTTO_CREAR_OPCION_MENU
    @CODIGO_OPCION    = 'ACA_PROSPECTO_ECONOMICO',
    @NOMBRE_OPCION    = 'Prospectos Socioeconómica',
    @URL_OPCION       = '/aca-prospecto-economico',
    @CODIGO_SISTEMA   = 'ACADEMICS',
    @CODIGO_MENU      = 'CONSULTA',
    @USUARIO_EJECUTOR = @USUARIO,
    @PERM_NUEVO       = @N,
    @PERM_MODIFICAR   = @M,
    @PERM_ELIMINAR    = @E,
    @PERM_IMPRIMIR    = @I,
    @SIMULAR          = @SIMULAR;

PRINT '=== 3. Favoritos que apuntaban a la URL vieja ===';
IF @SIMULAR = 0
BEGIN
    UPDATE dbo.SEG_SISTEMA_MENU_FAVORITOS
    SET PERMISSION_KEY = '/aca-prospecto-academico', ROUTE = '/aca-prospecto-academico', MODULE_NAME = 'Prospectos Académica'
    WHERE ROUTE = '/aca-prospecto' OR PERMISSION_KEY = '/aca-prospecto';
    PRINT CONCAT('Favoritos actualizados: ', @@ROWCOUNT);
END
ELSE
    SELECT USUARIO, PERMISSION_KEY, ROUTE, 'se actualizaría a /aca-prospecto-academico' AS ACCION
    FROM dbo.SEG_SISTEMA_MENU_FAVORITOS
    WHERE ROUTE = '/aca-prospecto' OR PERMISSION_KEY = '/aca-prospecto';

PRINT '=== Estado resultante ===';
SELECT O.CODIGO_OPCION, O.NOMBRE_OPCION, O.URL_OPCION, C.ORDEN_OPCION
FROM dbo.SEG_OPCION_SISTEMA O
JOIN dbo.SEG_CONFIG_OPCION C ON C.CODIGO_OPCION = O.CODIGO_OPCION
WHERE C.CODIGO_SISTEMA = 'ACADEMICS' AND C.CODIGO_MENU = 'CONSULTA'
ORDER BY C.ORDEN_OPCION;
GO
