/* ============================================================================
   Menú Bancos — Tablas Generales del Sistema (SGUEES)
   Opciones migradas con pantalla SPA + API:
     - Bancos (GEN_BANCO) — ver MENU_GEN_BANCO.sql (sistema GENERAL)
     - Cuentas Bancarias
     - Líneas Trabajo - Conciliación Bancaria
     - Tipos de Cheques
     - Tipos de Movimientos Bancarios
   Idempotente. Asigna permisos CRUD al usuario admin.
   ============================================================================
   Ejecutar:
     sqlcmd -S 192.168.0.250 -U erp -d SGUEES -f 65001 -i MENU_BANCOS_TABLAS_GENERALES.sql
   ============================================================================ */
SET NOCOUNT ON;

DECLARE @SISTEMA     varchar(30) = 'BANCOS';
DECLARE @SUITE       varchar(30) = 'SGUEES';
DECLARE @MENU        varchar(10) = 'GENERAL';
DECLARE @ORD_SISTEMA int         = 4;
DECLARE @ORD_MENU    int         = 4;
DECLARE @LOGIN       varchar(30) = 'admin';
DECLARE @USR         varchar(30) = 'admin';
DECLARE @EST         varchar(30) = 'SISTEMA';
DECLARE @HOY         datetime    = GETDATE();

/* ----------------------------------------------------------------------------
   0) Sistema BANCOS (Caja y Bancos)
   ---------------------------------------------------------------------------- */
MERGE SEG_SISTEMA AS T
USING (VALUES (@SISTEMA, 'Caja y Bancos', 'money', 'BAN', 'Banking')) AS S
    (CODIGO_SISTEMA, NOMBRE_SISTEMA, IMAGEN_SISTEMA, PREFIJO, NOMBRE_MODULO)
ON T.CODIGO_SISTEMA = S.CODIGO_SISTEMA
WHEN MATCHED THEN
    UPDATE SET T.NOMBRE_SISTEMA = S.NOMBRE_SISTEMA,
               T.IMAGEN_SISTEMA = S.IMAGEN_SISTEMA,
               T.PREFIJO = S.PREFIJO,
               T.NOMBRE_MODULO = S.NOMBRE_MODULO
WHEN NOT MATCHED THEN
    INSERT (CODIGO_SISTEMA, NOMBRE_SISTEMA, IMAGEN_SISTEMA, PREFIJO, NOMBRE_MODULO)
    VALUES (S.CODIGO_SISTEMA, S.NOMBRE_SISTEMA, S.IMAGEN_SISTEMA, S.PREFIJO, S.NOMBRE_MODULO);

/* ----------------------------------------------------------------------------
   1) Catálogo de opciones (SEG_OPCION_SISTEMA)
   ---------------------------------------------------------------------------- */
DECLARE @Opciones TABLE (
    CODIGO varchar(30),
    NOMBRE varchar(100),
    URL    nvarchar(4000),
    ORD    int
);

INSERT INTO @Opciones (CODIGO, NOMBRE, URL, ORD) VALUES
    (N'BAN_CUENTA_BANCARIA',              N'Cuentas Bancarias',                       N'/ban-cuenta-bancaria',              1),
    (N'BAN_LINEA_TRABAJO_CONCILIACION',   N'Líneas Trabajo - Conciliación Bancaria',  N'/ban-linea-trabajo-conciliacion',   2),
    (N'BAN_TIPO_CHEQUE',                  N'Tipos de Cheques',                        N'/ban-tipo-cheque',                  3),
    (N'BAN_TIPO_MOVI_BANCARIO',           N'Tipos de Movimientos Bancarios',          N'/ban-tipo-movi-bancario',           4);

MERGE SEG_OPCION_SISTEMA AS T
USING @Opciones AS S ON T.CODIGO_OPCION = S.CODIGO
WHEN MATCHED THEN
    UPDATE SET T.NOMBRE_OPCION = S.NOMBRE,
               T.URL_OPCION = S.URL,
               T.IMAGEN_OPCION = '',
               T.USUARIO_ACTU = @USR,
               T.FECHA_ACTU = @HOY,
               T.ESTACION_ACTU = @EST
WHEN NOT MATCHED THEN
    INSERT (CODIGO_OPCION, NOMBRE_OPCION, URL_OPCION, IMAGEN_OPCION, USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
    VALUES (S.CODIGO, S.NOMBRE, S.URL, '', @USR, @HOY, @EST);

/* ----------------------------------------------------------------------------
   2) Suite SGUEES
   ---------------------------------------------------------------------------- */
INSERT INTO SEG_OPCION_SISTEMA_SUITE (CODIGO_OPCION, CODIGO_SUITE)
SELECT o.CODIGO, @SUITE
FROM @Opciones o
WHERE NOT EXISTS (
    SELECT 1 FROM SEG_OPCION_SISTEMA_SUITE s
    WHERE s.CODIGO_OPCION = o.CODIGO AND s.CODIGO_SUITE = @SUITE
);

/* ----------------------------------------------------------------------------
   3) Configuración del menú (SEG_CONFIG_OPCION)
   ---------------------------------------------------------------------------- */
DELETE FROM SEG_CONFIG_OPCION
WHERE CODIGO_SISTEMA = @SISTEMA
  AND CODIGO_MENU = @MENU
  AND CODIGO_OPCION IN (SELECT CODIGO FROM @Opciones);

INSERT INTO SEG_CONFIG_OPCION
    (CODIGO_SISTEMA, CODIGO_MENU, CODIGO_OPCION, ORDEN_SISTEMA, ORDEN_MENU, ORDEN_OPCION, USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
SELECT @SISTEMA, @MENU, o.CODIGO, @ORD_SISTEMA, @ORD_MENU, o.ORD, @USR, @HOY, @EST
FROM @Opciones o;

/* ----------------------------------------------------------------------------
   4) Permisos usuario admin (SEG_USUARIO_OPCION) — CRUD completo
   ---------------------------------------------------------------------------- */
INSERT INTO SEG_USUARIO_OPCION
    (LOGIN_SISTEMA, CODIGO_SISTEMA, CODIGO_MENU, CODIGO_OPCION, NUEVO, MODIFICAR, ELIMINAR, IMPRIMIR, USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
SELECT @LOGIN, @SISTEMA, @MENU, o.CODIGO, 1, 1, 1, 1, @USR, @HOY, @EST
FROM @Opciones o
WHERE NOT EXISTS (
    SELECT 1 FROM SEG_USUARIO_OPCION u
    WHERE u.LOGIN_SISTEMA = @LOGIN
      AND u.CODIGO_SISTEMA = @SISTEMA
      AND u.CODIGO_MENU = @MENU
      AND u.CODIGO_OPCION = o.CODIGO
);

UPDATE u
SET u.NUEVO = 1,
    u.MODIFICAR = 1,
    u.ELIMINAR = 1,
    u.IMPRIMIR = 1,
    u.CODIGO_MENU = @MENU,
    u.USUARIO_ACTU = @USR,
    u.FECHA_ACTU = @HOY,
    u.ESTACION_ACTU = @EST
FROM SEG_USUARIO_OPCION u
INNER JOIN @Opciones o ON o.CODIGO = u.CODIGO_OPCION
WHERE u.LOGIN_SISTEMA = @LOGIN
  AND u.CODIGO_SISTEMA = @SISTEMA;

PRINT 'Menú Bancos — Tablas Generales configurado para usuario admin.';

/* ----------------------------------------------------------------------------
   Verificación
   ---------------------------------------------------------------------------- */
SELECT c.ORDEN_OPCION, c.CODIGO_OPCION, o.NOMBRE_OPCION, o.URL_OPCION,
       u.NUEVO, u.MODIFICAR, u.ELIMINAR, u.IMPRIMIR
FROM SEG_CONFIG_OPCION c
INNER JOIN SEG_OPCION_SISTEMA o ON c.CODIGO_OPCION = o.CODIGO_OPCION
LEFT JOIN SEG_USUARIO_OPCION u
    ON u.LOGIN_SISTEMA = @LOGIN
   AND u.CODIGO_SISTEMA = c.CODIGO_SISTEMA
   AND u.CODIGO_MENU = c.CODIGO_MENU
   AND u.CODIGO_OPCION = c.CODIGO_OPCION
WHERE c.CODIGO_SISTEMA = @SISTEMA AND c.CODIGO_MENU = @MENU
ORDER BY c.ORDEN_OPCION;
