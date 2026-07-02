/* ============================================================================
   Corrige acentos y eñes en SEG_OPCION_SISTEMA (UTF-8 mal guardado en VARCHAR).
   Ejecutar SIEMPRE con: sqlcmd ... -f 65001 -i FIX_ENCODING_MENU_TEXT.sql
   ============================================================================ */
SET NOCOUNT ON;

DECLARE @USR varchar(30) = N'admin';
DECLARE @EST varchar(30) = N'FIX_ENCODING';
DECLARE @HOY datetime = GETDATE();

DECLARE @Fix TABLE (CODIGO varchar(30) NOT NULL, NOMBRE nvarchar(100) NOT NULL);
INSERT INTO @Fix (CODIGO, NOMBRE) VALUES
    (N'BAN_LINEA_TRABAJO_CONCILIACION', N'Líneas Trabajo - Conciliación Bancaria'),
    (N'CON_PARTIDA_ANULAR',            N'Anulación de Partidas Contables'),
    (N'CON_CTA_AUXILIAR',              N'Catálogo de Cuentas Auxiliar'),
    (N'CON_CATALOGO_CUENTA',           N'Catálogo de Cuentas'),
    (N'CON_PARAMETRO',                 N'Parámetros Contabilidad'),
    (N'CON_AREA_FUNCIONAL',            N'Área Funcional'),
    (N'CON_REPO_BALANCE_COMPRO',       N'Balance de Comprobación'),
    (N'CON_REPO_BALANCE_COMPRO_MES',   N'Balance de Comprobación - Saldo Mes'),
    (N'COM_TIPO_DOC_FISICO',           N'Tipos de Doc. Físico'),
    (N'COM_CUADRO_COMPARATIVO_AUTORIZ',N'Autorizar Cuadros Comparativos'),
    (N'GEN_PAIS',                      N'Países'),
    (N'GEN_SECTOR_ECONOMICO',          N'Sectores económicos'),
    (N'PLA_NIVEL_ACADEMICO',           N'Nivel Académico'),
    (N'SC_COMPETENCIAS_TECNICAS',      N'Competencias Técnicas'),
    (N'SC_IMPACTO_ECONOMICO',          N'Impacto Económico'),
    (N'SC_TIPO_CONTRATACION',          N'Tipo Contratación'),
    (N'SC_REQUISICION',                N'Requisición de personal'),
    (N'SC_RIESGO_PUESTO',              N'Riesgos Físicos Del Puesto'),
    (N'SEG_CONFIG_OPCION',             N'Configuración');

UPDATE o
SET o.NOMBRE_OPCION = CONVERT(varchar(100), f.NOMBRE),
    o.USUARIO_ACTU = @USR,
    o.FECHA_ACTU = @HOY,
    o.ESTACION_ACTU = @EST
FROM SEG_OPCION_SISTEMA o
INNER JOIN @Fix f ON f.CODIGO = o.CODIGO_OPCION
WHERE o.NOMBRE_OPCION <> CONVERT(varchar(100), f.NOMBRE);

PRINT CONCAT('Opciones corregidas: ', @@ROWCOUNT);

SELECT CODIGO_OPCION, NOMBRE_OPCION
FROM SEG_OPCION_SISTEMA
WHERE CODIGO_OPCION IN (SELECT CODIGO FROM @Fix)
ORDER BY CODIGO_OPCION;
