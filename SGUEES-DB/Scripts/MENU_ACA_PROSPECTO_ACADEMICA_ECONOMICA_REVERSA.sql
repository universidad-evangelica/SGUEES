-- ============================================================================================================
-- Reversa de MENU_ACA_PROSPECTO_ACADEMICA_ECONOMICA.sql: vuelve a una sola opción "Prospectos" en /aca-prospecto
-- y elimina la opción económica con sus permisos. Publicar junto con el API/SPA anteriores (que usan /aca-prospecto).
-- ============================================================================================================
USE [SGUEES]
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

UPDATE dbo.SEG_OPCION_SISTEMA
SET NOMBRE_OPCION = 'Prospectos', URL_OPCION = '/aca-prospecto', FECHA_ACTU = GETDATE()
WHERE CODIGO_OPCION = 'ACA_PROSPECTO';

UPDATE dbo.SEG_SISTEMA_MENU_FAVORITOS
SET PERMISSION_KEY = '/aca-prospecto', ROUTE = '/aca-prospecto', MODULE_NAME = 'Prospectos'
WHERE ROUTE = '/aca-prospecto-academico' OR PERMISSION_KEY = '/aca-prospecto-academico';

DELETE FROM dbo.SEG_SISTEMA_MENU_FAVORITOS WHERE ROUTE = '/aca-prospecto-economico' OR PERMISSION_KEY = '/aca-prospecto-economico';
DELETE FROM dbo.SEG_USUARIO_OPCION      WHERE CODIGO_OPCION = 'ACA_PROSPECTO_ECONOMICO';
DELETE FROM dbo.SEG_TIPO_USUARIO_OPCION WHERE CODIGO_OPCION = 'ACA_PROSPECTO_ECONOMICO';
DELETE FROM dbo.SEG_OPCION_SISTEMA_SUITE WHERE CODIGO_OPCION = 'ACA_PROSPECTO_ECONOMICO';
DELETE FROM dbo.SEG_CONFIG_OPCION       WHERE CODIGO_OPCION = 'ACA_PROSPECTO_ECONOMICO';
DELETE FROM dbo.SEG_OPCION_SISTEMA      WHERE CODIGO_OPCION = 'ACA_PROSPECTO_ECONOMICO';

COMMIT TRANSACTION;

SELECT CODIGO_OPCION, NOMBRE_OPCION, URL_OPCION FROM dbo.SEG_OPCION_SISTEMA WHERE CODIGO_OPCION LIKE 'ACA_PROSPECTO%';
GO
