-- Qué hace: deja la dirección del menú igual que la carpeta y la política del API.
-- Cómo lo hace: Solicitud socioeconómica pasa de /aca-prospecto-economico a /aca-prospecto-socioeconomico.
-- Después de ejecutarlo hay que volver a entrar al sistema para que el permiso quede en la sesión.

UPDATE dbo.SEG_OPCION_SISTEMA
SET URL_OPCION = '/aca-prospecto-socioeconomico',
    USUARIO_ACTU = 'juanh',
    FECHA_ACTU = GETDATE()
WHERE CODIGO_OPCION = 'ACA_PROSPECTO_ECONOMICO'
  AND URL_OPCION = '/aca-prospecto-economico';

UPDATE dbo.SEG_SISTEMA_MENU_FAVORITOS
SET ROUTE = '/aca-prospecto-socioeconomico',
    PERMISSION_KEY = '/aca-prospecto-socioeconomico'
WHERE ROUTE = '/aca-prospecto-economico'
   OR PERMISSION_KEY = '/aca-prospecto-economico';
