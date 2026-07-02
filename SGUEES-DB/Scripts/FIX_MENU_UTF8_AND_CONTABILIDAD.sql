/* ============================================================================
   1) Columnas de menú a NVARCHAR (acentos/eñes en SQL Server)
   2) Textos corregidos en SEG_OPCION_SISTEMA / SEG_MENU_SISTEMA
   3) Orden de Partidas Contables en menú PROCESO (primera opción)

   Ejecutar:
     sqlcmd -S <servidor> -d SGUEES -U <user> -f 65001 -i FIX_MENU_UTF8_AND_CONTABILIDAD.sql
   ============================================================================ */
SET NOCOUNT ON;

IF EXISTS (
    SELECT 1
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID(N'dbo.SEG_OPCION_SISTEMA')
      AND c.name = N'NOMBRE_OPCION'
      AND t.name = N'varchar'
)
BEGIN
    ALTER TABLE dbo.SEG_OPCION_SISTEMA ALTER COLUMN NOMBRE_OPCION NVARCHAR(100) NOT NULL;
    PRINT 'SEG_OPCION_SISTEMA.NOMBRE_OPCION -> NVARCHAR(100)';
END

IF EXISTS (
    SELECT 1
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID(N'dbo.SEG_MENU_SISTEMA')
      AND c.name = N'NOMBRE_MENU'
      AND t.name = N'varchar'
)
BEGIN
    ALTER TABLE dbo.SEG_MENU_SISTEMA ALTER COLUMN NOMBRE_MENU NVARCHAR(100) NOT NULL;
    PRINT 'SEG_MENU_SISTEMA.NOMBRE_MENU -> NVARCHAR(100)';
END

IF EXISTS (
    SELECT 1
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID(N'dbo.SEG_SISTEMA')
      AND c.name = N'NOMBRE_SISTEMA'
      AND t.name = N'varchar'
)
BEGIN
    ALTER TABLE dbo.SEG_SISTEMA ALTER COLUMN NOMBRE_SISTEMA NVARCHAR(100) NOT NULL;
    PRINT 'SEG_SISTEMA.NOMBRE_SISTEMA -> NVARCHAR(100)';
END

DECLARE @USR NVARCHAR(30) = N'admin';
DECLARE @EST NVARCHAR(30) = N'FIX_UTF8';
DECLARE @HOY datetime = GETDATE();

DECLARE @FixOpcion TABLE (CODIGO varchar(30) NOT NULL, NOMBRE nvarchar(100) NOT NULL);
INSERT INTO @FixOpcion (CODIGO, NOMBRE) VALUES
    (N'CON_PARTIDA',                     N'Partidas Contables'),
    (N'CON_PARTIDA_APLICAR',             N'Aplicar Partidas Contables'),
    (N'CON_PARTIDA_DESAPLICAR',          N'Des-Aplicar Partidas Contables'),
    (N'CON_PARTIDA_ANULAR',              N'Anulación de Partidas Contables'),
    (N'CON_PARTIDA_MODELO',              N'Modelos de Partidas'),
    (N'CON_CIERRE_APERTURA',             N'Cierre / Apertura de Períodos'),
    (N'CON_CATALOGO_CUENTA',             N'Catálogo de Cuentas'),
    (N'CON_CTA_CENTRO_COSTO',            N'Cuenta Contable - Centro de Costo'),
    (N'CON_CENTRO_COSTO',                N'Centro de Costos'),
    (N'CON_PERIODO_CONTABLE',            N'Períodos Contables'),
    (N'CON_CLASE_PARTIDA',               N'Clase de Partidas'),
    (N'CON_CATALOGO_PRESUPUESTO',        N'Presupuesto Anual'),
    (N'CON_PARAMETRO',                   N'Parámetros Contabilidad'),
    (N'CON_AREA_FUNCIONAL',              N'Área Funcional'),
    (N'CON_RUBRO',                       N'Rubros'),
    (N'BAN_LINEA_TRABAJO_CONCILIACION',  N'Líneas Trabajo - Conciliación Bancaria'),
    (N'COM_TIPO_DOC_FISICO',             N'Tipos de Doc. Físico'),
    (N'GEN_PAIS',                        N'Países'),
    (N'GEN_SECTOR_ECONOMICO',            N'Sectores económicos'),
    (N'PLA_NIVEL_ACADEMICO',             N'Nivel Académico'),
    (N'SEG_CONFIG_OPCION',               N'Configuración');

UPDATE o
SET o.NOMBRE_OPCION = f.NOMBRE,
    o.USUARIO_ACTU = @USR,
    o.FECHA_ACTU = @HOY,
    o.ESTACION_ACTU = @EST
FROM dbo.SEG_OPCION_SISTEMA o
INNER JOIN @FixOpcion f ON f.CODIGO = o.CODIGO_OPCION
WHERE o.NOMBRE_OPCION <> f.NOMBRE;

PRINT CONCAT('Opciones corregidas: ', @@ROWCOUNT);

/* Duplicados usuario/opción en menús distintos (deja solo el de SEG_CONFIG_OPCION) */
DELETE u
FROM dbo.SEG_USUARIO_OPCION u
WHERE EXISTS (
    SELECT 1
    FROM dbo.SEG_CONFIG_OPCION c
    WHERE c.CODIGO_SISTEMA = u.CODIGO_SISTEMA
      AND c.CODIGO_OPCION = u.CODIGO_OPCION
      AND c.CODIGO_MENU <> u.CODIGO_MENU
);

PRINT CONCAT('Permisos usuario alineados con config: ', @@ROWCOUNT);

/* Partidas Contables: primera en PROCESO del sistema Contabilidad */
UPDATE c
SET c.CODIGO_MENU = N'PROCESO',
    c.ORDEN_MENU = 1,
    c.ORDEN_OPCION = 1,
    c.USUARIO_ACTU = @USR,
    c.FECHA_ACTU = @HOY,
    c.ESTACION_ACTU = @EST
FROM dbo.SEG_CONFIG_OPCION c
WHERE c.CODIGO_SISTEMA = N'CONTABILIDAD'
  AND c.CODIGO_OPCION = N'CON_PARTIDA';

UPDATE u
SET u.CODIGO_MENU = N'PROCESO',
    u.USUARIO_ACTU = @USR,
    u.FECHA_ACTU = @HOY,
    u.ESTACION_ACTU = @EST
FROM dbo.SEG_USUARIO_OPCION u
WHERE u.CODIGO_SISTEMA = N'CONTABILIDAD'
  AND u.CODIGO_OPCION = N'CON_PARTIDA'
  AND u.CODIGO_MENU <> N'PROCESO';

PRINT 'Menú Contabilidad / Partidas Contables alineado.';

SELECT c.CODIGO_MENU, c.ORDEN_OPCION, c.CODIGO_OPCION, o.NOMBRE_OPCION, o.URL_OPCION
FROM dbo.SEG_CONFIG_OPCION c
INNER JOIN dbo.SEG_OPCION_SISTEMA o ON o.CODIGO_OPCION = c.CODIGO_OPCION
WHERE c.CODIGO_SISTEMA = N'CONTABILIDAD'
  AND c.CODIGO_OPCION LIKE 'CON_PARTIDA%'
ORDER BY c.ORDEN_MENU, c.ORDEN_OPCION;
