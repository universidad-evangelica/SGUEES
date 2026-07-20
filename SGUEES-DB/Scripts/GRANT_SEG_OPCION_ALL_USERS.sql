/* ============================================================================
   Otorga "Opciones del Sistema" a todos los usuarios que ya tienen
   "Configuración de Opciones" (misma ubicación menú y mismos permisos).
   ============================================================================
   Ejecutar:
     sqlcmd -S 192.168.0.250 -U erp -d SGUEES -f 65001 -i GRANT_SEG_OPCION_ALL_USERS.sql
   ============================================================================ */
SET NOCOUNT ON;

DECLARE @USR varchar(30) = 'admin';
DECLARE @EST varchar(30) = 'SISTEMA';
DECLARE @HOY datetime    = GETDATE();

INSERT INTO SEG_USUARIO_OPCION
    (LOGIN_SISTEMA, CODIGO_SISTEMA, CODIGO_MENU, CODIGO_OPCION, NUEVO, MODIFICAR, ELIMINAR, IMPRIMIR, USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
SELECT u.LOGIN_SISTEMA,
       u.CODIGO_SISTEMA,
       u.CODIGO_MENU,
       N'SEG_OPCION_SISTEMA',
       u.NUEVO,
       u.MODIFICAR,
       u.ELIMINAR,
       u.IMPRIMIR,
       @USR,
       @HOY,
       @EST
FROM SEG_USUARIO_OPCION u
WHERE u.CODIGO_OPCION = N'SEG_CONFIG_OPCION'
  AND NOT EXISTS (
      SELECT 1 FROM SEG_USUARIO_OPCION x
      WHERE x.LOGIN_SISTEMA = u.LOGIN_SISTEMA
        AND x.CODIGO_SISTEMA = u.CODIGO_SISTEMA
        AND x.CODIGO_MENU = u.CODIGO_MENU
        AND x.CODIGO_OPCION = N'SEG_OPCION_SISTEMA'
  );

PRINT CONCAT(N'Permisos SEG_OPCION_SISTEMA otorgados: ', @@ROWCOUNT);

SELECT u.LOGIN_SISTEMA, u.CODIGO_SISTEMA, u.CODIGO_MENU, o.URL_OPCION
FROM SEG_USUARIO_OPCION u
INNER JOIN SEG_OPCION_SISTEMA o ON u.CODIGO_OPCION = o.CODIGO_OPCION
WHERE o.URL_OPCION = N'/seg-opcion-sistema'
ORDER BY u.LOGIN_SISTEMA, u.CODIGO_SISTEMA, u.CODIGO_MENU;
