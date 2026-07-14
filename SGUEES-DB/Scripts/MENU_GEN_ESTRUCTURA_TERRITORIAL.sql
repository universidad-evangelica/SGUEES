/* ============================================================================
   Menú Generales — Estructura Territorial
   - Alta / actualización de GEN_ESTRUCTURA_TERRITORIAL → /gen-estructura-territorial
   - Quita del menú las opciones sueltas legacy (Países / Depto / Municipio / Distrito)
   - Idempotente. Migra permisos de GEN_PAIS (y siblings si existen) a la opción unificada.
   ============================================================================
   Ejecutar:
     sqlcmd -S <srv> -d SGUEES -U <user> -f 65001 -i MENU_GEN_ESTRUCTURA_TERRITORIAL.sql
   ============================================================================ */
SET NOCOUNT ON;

DECLARE @SISTEMA     varchar(30) = 'GENERAL';
DECLARE @MENU        varchar(10) = 'GENERAL';
DECLARE @SUITE       varchar(30) = 'SGUEES';
DECLARE @OPCION      varchar(30) = N'GEN_ESTRUCTURA_TERRITORIAL';
DECLARE @ORD_MENU    int         = 1;
DECLARE @ORD_OPCION  int         = 8; /* GEN_BANCO usa 7; ajustar si el orden en BD difiere */
DECLARE @LOGIN       varchar(30) = 'admin';
DECLARE @USR         varchar(30) = 'admin';
DECLARE @EST         varchar(30) = 'SISTEMA';
DECLARE @HOY         datetime    = GETDATE();

DECLARE @Legacy TABLE (CODIGO varchar(30) PRIMARY KEY);
INSERT INTO @Legacy (CODIGO) VALUES
    (N'GEN_PAIS'),
    (N'GEN_DEPTO'),
    (N'GEN_MUNICIPIO'),
    (N'GEN_DISTRITO'),
    (N'GEN_DEPARTAMENTO'),
    (N'GEN_PAISES');

/* ----------------------------------------------------------------------------
   1) Catálogo: opción unificada
   ---------------------------------------------------------------------------- */
MERGE SEG_OPCION_SISTEMA AS T
USING (VALUES
    (@OPCION, N'Estructura Territorial', N'/gen-estructura-territorial')
) AS S (CODIGO, NOMBRE, URL)
ON T.CODIGO_OPCION = S.CODIGO
WHEN MATCHED THEN
    UPDATE SET T.NOMBRE_OPCION = S.NOMBRE,
               T.URL_OPCION = S.URL,
               T.IMAGEN_OPCION = N'mdi mdi-undefined',
               T.USUARIO_ACTU = @USR,
               T.FECHA_ACTU = @HOY,
               T.ESTACION_ACTU = @EST
WHEN NOT MATCHED THEN
    INSERT (CODIGO_OPCION, NOMBRE_OPCION, URL_OPCION, IMAGEN_OPCION, USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
    VALUES (S.CODIGO, S.NOMBRE, S.URL, N'mdi mdi-undefined', @USR, @HOY, @EST);

/* También por URL legacy → apuntar a la pantalla unificada si existiera otra opción */
UPDATE SEG_OPCION_SISTEMA
SET NOMBRE_OPCION = N'Estructura Territorial',
    URL_OPCION = N'/gen-estructura-territorial',
    USUARIO_ACTU = @USR,
    FECHA_ACTU = @HOY,
    ESTACION_ACTU = @EST
WHERE URL_OPCION IN (N'/gen-pais', N'/gen-depto', N'/gen-municipio', N'/gen-distrito', N'/gen-estructura-territorial')
  AND CODIGO_OPCION = @OPCION;

INSERT INTO SEG_OPCION_SISTEMA_SUITE (CODIGO_OPCION, CODIGO_SUITE)
SELECT @OPCION, @SUITE
WHERE NOT EXISTS (
    SELECT 1 FROM SEG_OPCION_SISTEMA_SUITE s
    WHERE s.CODIGO_OPCION = @OPCION AND s.CODIGO_SUITE = @SUITE
);

/* ----------------------------------------------------------------------------
   2) Config menú GENERAL: quitar legacy, dejar solo Estructura Territorial
   ---------------------------------------------------------------------------- */
DELETE FROM SEG_CONFIG_OPCION
WHERE CODIGO_SISTEMA = @SISTEMA
  AND (
        CODIGO_OPCION IN (SELECT CODIGO FROM @Legacy)
     OR CODIGO_OPCION = @OPCION
     OR CODIGO_OPCION IN (
            SELECT o.CODIGO_OPCION
            FROM SEG_OPCION_SISTEMA o
            WHERE o.URL_OPCION IN (N'/gen-pais', N'/gen-depto', N'/gen-municipio', N'/gen-distrito')
        )
  );

INSERT INTO SEG_CONFIG_OPCION
    (CODIGO_SISTEMA, CODIGO_MENU, CODIGO_OPCION, ORDEN_SISTEMA, ORDEN_MENU, ORDEN_OPCION, USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
VALUES (@SISTEMA, @MENU, @OPCION, 0, @ORD_MENU, @ORD_OPCION, @USR, @HOY, @EST);

/* ----------------------------------------------------------------------------
   3) Permisos: migrar desde GEN_PAIS (y siblings) → GEN_ESTRUCTURA_TERRITORIAL
   ---------------------------------------------------------------------------- */
INSERT INTO SEG_USUARIO_OPCION
    (LOGIN_SISTEMA, CODIGO_SISTEMA, CODIGO_MENU, CODIGO_OPCION, NUEVO, MODIFICAR, ELIMINAR, IMPRIMIR, USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
SELECT
    u.LOGIN_SISTEMA,
    @SISTEMA,
    @MENU,
    @OPCION,
    MAX(CONVERT(int, u.NUEVO)),
    MAX(CONVERT(int, u.MODIFICAR)),
    MAX(CONVERT(int, u.ELIMINAR)),
    MAX(CONVERT(int, u.IMPRIMIR)),
    @USR,
    @HOY,
    @EST
FROM SEG_USUARIO_OPCION u
WHERE u.CODIGO_OPCION IN (SELECT CODIGO FROM @Legacy)
   OR u.CODIGO_OPCION IN (
        SELECT o.CODIGO_OPCION
        FROM SEG_OPCION_SISTEMA o
        WHERE o.URL_OPCION IN (N'/gen-pais', N'/gen-depto', N'/gen-municipio', N'/gen-distrito')
    )
GROUP BY u.LOGIN_SISTEMA
HAVING NOT EXISTS (
    SELECT 1 FROM SEG_USUARIO_OPCION x
    WHERE x.LOGIN_SISTEMA = u.LOGIN_SISTEMA
      AND x.CODIGO_SISTEMA = @SISTEMA
      AND x.CODIGO_MENU = @MENU
      AND x.CODIGO_OPCION = @OPCION
);

DELETE FROM SEG_USUARIO_OPCION
WHERE CODIGO_OPCION IN (SELECT CODIGO FROM @Legacy)
   OR CODIGO_OPCION IN (
        SELECT o.CODIGO_OPCION
        FROM SEG_OPCION_SISTEMA o
        WHERE o.URL_OPCION IN (N'/gen-pais', N'/gen-depto', N'/gen-municipio', N'/gen-distrito')
          AND o.CODIGO_OPCION <> @OPCION
    );

/* Permisos admin por defecto */
INSERT INTO SEG_USUARIO_OPCION
    (LOGIN_SISTEMA, CODIGO_SISTEMA, CODIGO_MENU, CODIGO_OPCION, NUEVO, MODIFICAR, ELIMINAR, IMPRIMIR, USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
SELECT @LOGIN, @SISTEMA, @MENU, @OPCION, 1, 1, 1, 1, @USR, @HOY, @EST
WHERE NOT EXISTS (
    SELECT 1 FROM SEG_USUARIO_OPCION u
    WHERE u.LOGIN_SISTEMA = @LOGIN
      AND u.CODIGO_SISTEMA = @SISTEMA
      AND u.CODIGO_MENU = @MENU
      AND u.CODIGO_OPCION = @OPCION
);

/* ----------------------------------------------------------------------------
   4) Quitar opciones legacy del catálogo (solo menú; NO borra tablas GEN_*)
   ---------------------------------------------------------------------------- */
DELETE FROM SEG_OPCION_SISTEMA_SUITE
WHERE CODIGO_OPCION IN (SELECT CODIGO FROM @Legacy);

DELETE FROM SEG_OPCION_SISTEMA
WHERE CODIGO_OPCION IN (SELECT CODIGO FROM @Legacy);

PRINT N'Menú Generales — Estructura Territorial configurada; opciones Países/Depto/Municipio/Distrito removidas del menú.';

SELECT c.CODIGO_SISTEMA, c.CODIGO_MENU, c.ORDEN_OPCION, c.CODIGO_OPCION, o.NOMBRE_OPCION, o.URL_OPCION
FROM SEG_CONFIG_OPCION c
INNER JOIN SEG_OPCION_SISTEMA o ON c.CODIGO_OPCION = o.CODIGO_OPCION
WHERE c.CODIGO_SISTEMA = @SISTEMA
  AND c.CODIGO_MENU = @MENU
  AND (
        c.CODIGO_OPCION = @OPCION
     OR c.CODIGO_OPCION LIKE N'GEN_%'
  )
ORDER BY c.ORDEN_OPCION, c.CODIGO_OPCION;
