/*
  Clase de partida APE requerida por migracion de saldos iniciales y PRAL_GENE_PARTIDA_APERTURA.
*/
SET NOCOUNT ON;

IF NOT EXISTS (
    SELECT 1
    FROM CON_CLASE_PARTIDA
    WHERE CORR_EMPRESA = 1
      AND NOMBRE_CORTO_CLASE = 'APE'
)
BEGIN
    INSERT INTO CON_CLASE_PARTIDA
    (
        CORR_EMPRESA,
        CORR_CLASE_PARTIDA,
        NOMBRE_CLASE_PARTIDA,
        NOMBRE_CORTO_CLASE,
        CORR_LINEA_AUMENTA,
        CORR_LINEA_DISMINUYE,
        ACEPTA_MODIFICACION,
        PARTIDA_CIERRE,
        NOMBRE_REPORTE,
        CODIGO_ODS
    )
    VALUES
    (
        1,
        4,
        'APERTURA',
        'APE',
        0,
        0,
        1,
        0,
        'PARTIDA_CONTABLE',
        NULL
    );

    PRINT 'Clase APE creada (CORR_CLASE_PARTIDA=4).';
END
ELSE
    PRINT 'Clase APE ya existe.';
GO
