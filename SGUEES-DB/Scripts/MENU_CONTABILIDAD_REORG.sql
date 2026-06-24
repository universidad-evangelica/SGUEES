/* ============================================================================
   Reorganización del menú de Contabilidad (SGUEES) según e-Admin
   - Solo opciones con pantalla funcional ya migrada
   - Excluye: moneda, foráneo, impresiones/reportes, ODS, proyectos, anexos
   - Idempotente: se puede ejecutar varias veces sin duplicar
   ============================================================================ */
SET NOCOUNT ON;
DECLARE @SISTEMA varchar(30) = 'CONTABILIDAD';
DECLARE @SUITE   varchar(30) = 'SGUEES';
DECLARE @USR     varchar(30) = 'admin';
DECLARE @EST     varchar(30) = 'SISTEMA';
DECLARE @HOY     datetime    = GETDATE();

/* ----------------------------------------------------------------------------
   1) Catálogo de opciones (SEG_OPCION_SISTEMA) — alta de las que faltan
   ---------------------------------------------------------------------------- */
DECLARE @Opciones TABLE (CODIGO varchar(30), NOMBRE varchar(100), URL nvarchar(4000), IMG varchar(25));
INSERT INTO @Opciones (CODIGO, NOMBRE, URL, IMG) VALUES
  ('CON_PARTIDA_APLICAR',              'Aplicar Partidas Contables',          '/con-partida-aplicar',              ''),
  ('CON_PARTIDA_DESAPLICAR',           'Des-Aplicar Partidas Contables',      '/con-partida-desaplicar',           ''),
  ('CON_PARTIDA_ANULAR',               'Anulación de Partidas Contables',     '/con-partida-anular',               ''),
  ('CON_CIERRE_APERTURA',              'Cierre / Apertura de Periodos',       '/con-cierre-apertura',              ''),
  ('CON_PARTIDA_MODELO',               'Modelos de Partidas',                 '/con-partida-modelo',               ''),
  ('CON_CTA_CENTRO_COSTO',             'Cuenta Contable - Centro de Costo',   '/con-catalogo-cuenta-centro-costo', '');

MERGE SEG_OPCION_SISTEMA AS T
USING @Opciones AS S ON T.CODIGO_OPCION = S.CODIGO
WHEN MATCHED THEN
  UPDATE SET T.NOMBRE_OPCION = S.NOMBRE, T.URL_OPCION = S.URL, T.IMAGEN_OPCION = S.IMG,
             T.USUARIO_ACTU = @USR, T.FECHA_ACTU = @HOY, T.ESTACION_ACTU = @EST
WHEN NOT MATCHED THEN
  INSERT (CODIGO_OPCION, NOMBRE_OPCION, URL_OPCION, IMAGEN_OPCION, USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
  VALUES (S.CODIGO, S.NOMBRE, S.URL, S.IMG, @USR, @HOY, @EST);

/* Renombrar opciones existentes para que coincidan con e-Admin */
UPDATE SEG_OPCION_SISTEMA SET NOMBRE_OPCION='Partidas Contables'   WHERE CODIGO_OPCION='CON_PARTIDA';
UPDATE SEG_OPCION_SISTEMA SET NOMBRE_OPCION='Presupuesto Anual'    WHERE CODIGO_OPCION='CON_CATALOGO_PRESUPUESTO';
UPDATE SEG_OPCION_SISTEMA SET NOMBRE_OPCION='Catalogo de Cuentas'  WHERE CODIGO_OPCION='CON_CATALOGO_CUENTA';
UPDATE SEG_OPCION_SISTEMA SET NOMBRE_OPCION='Centro de Costos'     WHERE CODIGO_OPCION='CON_CENTRO_COSTO';
UPDATE SEG_OPCION_SISTEMA SET NOMBRE_OPCION='Periodos Contables'   WHERE CODIGO_OPCION='CON_PERIODO_CONTABLE';
UPDATE SEG_OPCION_SISTEMA SET NOMBRE_OPCION='Clase de Partidas'    WHERE CODIGO_OPCION='CON_CLASE_PARTIDA';
UPDATE SEG_OPCION_SISTEMA SET NOMBRE_OPCION='Rubros'               WHERE CODIGO_OPCION='CON_RUBRO';

/* Quitar iconos de todas las opciones de Contabilidad */
UPDATE SEG_OPCION_SISTEMA SET IMAGEN_OPCION='' WHERE CODIGO_OPCION LIKE 'CON%';

/* ----------------------------------------------------------------------------
   2) Suite (SEG_OPCION_SISTEMA_SUITE)
   ---------------------------------------------------------------------------- */
INSERT INTO SEG_OPCION_SISTEMA_SUITE (CODIGO_OPCION, CODIGO_SUITE)
SELECT o.CODIGO, @SUITE FROM @Opciones o
WHERE NOT EXISTS (SELECT 1 FROM SEG_OPCION_SISTEMA_SUITE s
                  WHERE s.CODIGO_OPCION=o.CODIGO AND s.CODIGO_SUITE=@SUITE);

/* ----------------------------------------------------------------------------
   3) Configuración del menú (SEG_CONFIG_OPCION) — sistema/menú/orden
      PROCESO  (ORDEN_MENU=1): operaciones de partidas + presupuesto
      GENERAL  (ORDEN_MENU=4): tablas/catálogos
   ---------------------------------------------------------------------------- */
DECLARE @Config TABLE (MENU varchar(10), OPCION varchar(30), ORD_MENU int, ORD_OPC int);
INSERT INTO @Config (MENU, OPCION, ORD_MENU, ORD_OPC) VALUES
  -- Procesos del Sistema
  ('PROCESO', 'CON_PARTIDA',                      1, 1),
  ('PROCESO', 'CON_PARTIDA_APLICAR',              1, 2),
  ('PROCESO', 'CON_PARTIDA_DESAPLICAR',           1, 3),
  ('PROCESO', 'CON_PARTIDA_ANULAR',               1, 4),
  ('PROCESO', 'CON_CIERRE_APERTURA',              1, 5),
  ('PROCESO', 'CON_PARTIDA_MODELO',               1, 6),
  ('PROCESO', 'CON_CATALOGO_PRESUPUESTO',         1, 7),
  -- Tablas Generales del Sistema
  ('GENERAL', 'CON_RUBRO',                        4, 1),
  ('GENERAL', 'CON_CATALOGO_CUENTA',              4, 2),
  ('GENERAL', 'CON_CTA_CENTRO_COSTO',             4, 3),
  ('GENERAL', 'CON_CENTRO_COSTO',                 4, 4),
  ('GENERAL', 'CON_TIPO_CENTRO_COSTO',            4, 5),
  ('GENERAL', 'CON_PERIODO_CONTABLE',             4, 6),
  ('GENERAL', 'CON_CLASE_PARTIDA',                4, 7),
  ('GENERAL', 'CON_AREA_FUNCIONAL',               4, 8),
  ('GENERAL', 'CON_DIVISION',                     4, 9),
  ('GENERAL', 'CON_GERENCIA',                     4, 10),
  ('GENERAL', 'CON_DEPARTAMENTO',                 4, 11),
  ('GENERAL', 'CON_SECCION',                      4, 12),
  ('GENERAL', 'CON_PARAMETRO',                    4, 13);

/* Limpiar config previa de contabilidad para reescribir órdenes correctos */
DELETE FROM SEG_CONFIG_OPCION
WHERE CODIGO_SISTEMA=@SISTEMA AND CODIGO_OPCION LIKE 'CON%';

INSERT INTO SEG_CONFIG_OPCION
  (CODIGO_SISTEMA, CODIGO_MENU, CODIGO_OPCION, ORDEN_SISTEMA, ORDEN_MENU, ORDEN_OPCION, USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
SELECT @SISTEMA, c.MENU, c.OPCION, 2, c.ORD_MENU, c.ORD_OPC, @USR, @HOY, @EST
FROM @Config c;

/* ----------------------------------------------------------------------------
   4) Permisos por usuario (SEG_USUARIO_OPCION)
      Replica los permisos para los usuarios admin que ya tienen Contabilidad
   ---------------------------------------------------------------------------- */
DECLARE @Logins TABLE (LOGIN_SISTEMA varchar(30));
INSERT INTO @Logins (LOGIN_SISTEMA)
SELECT DISTINCT LOGIN_SISTEMA FROM SEG_USUARIO_OPCION
WHERE CODIGO_OPCION = 'CON_PARTIDA';

INSERT INTO SEG_USUARIO_OPCION
  (LOGIN_SISTEMA, CODIGO_SISTEMA, CODIGO_MENU, CODIGO_OPCION, NUEVO, MODIFICAR, ELIMINAR, IMPRIMIR, USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
SELECT l.LOGIN_SISTEMA, @SISTEMA, c.MENU, c.OPCION, 1, 1, 1, 1, @USR, @HOY, @EST
FROM @Logins l
CROSS JOIN @Config c
WHERE NOT EXISTS (
  SELECT 1 FROM SEG_USUARIO_OPCION u
  WHERE u.LOGIN_SISTEMA = l.LOGIN_SISTEMA
    AND u.CODIGO_SISTEMA = @SISTEMA
    AND u.CODIGO_OPCION  = c.OPCION
);

/* Alinear CODIGO_MENU de permisos ya existentes con la nueva config */
UPDATE u
SET u.CODIGO_MENU = c.MENU, u.USUARIO_ACTU=@USR, u.FECHA_ACTU=@HOY, u.ESTACION_ACTU=@EST
FROM SEG_USUARIO_OPCION u
INNER JOIN @Config c ON c.OPCION = u.CODIGO_OPCION
WHERE u.CODIGO_SISTEMA=@SISTEMA AND u.CODIGO_MENU <> c.MENU;

PRINT 'Menú de Contabilidad reorganizado correctamente.';

/* ----------------------------------------------------------------------------
   Verificación
   ---------------------------------------------------------------------------- */
SELECT c.CODIGO_MENU, m.NOMBRE_MENU, c.ORDEN_OPCION, c.CODIGO_OPCION, o.NOMBRE_OPCION, o.URL_OPCION
FROM SEG_CONFIG_OPCION c
INNER JOIN SEG_MENU_SISTEMA m ON c.CODIGO_MENU=m.CODIGO_MENU
INNER JOIN SEG_OPCION_SISTEMA o ON c.CODIGO_OPCION=o.CODIGO_OPCION
WHERE c.CODIGO_SISTEMA=@SISTEMA AND c.CODIGO_OPCION LIKE 'CON%'
ORDER BY c.ORDEN_MENU, c.ORDEN_OPCION;
