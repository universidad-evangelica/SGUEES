/*
================================================================================
  APERTURA COMPLETA CLASS (129) -> SGUEES (250)
  Partida de apertura con saldos al corte desde CLASS_UEES (solo lectura en 129).

  Que hace (modo EJECUTAR):
    1) LIMPIAR  - Des-aplica partidas AP, elimina CON_PARTIDA / CON_PARTIDA_DETA
                  y CON_CATALOGO_SALDO_HIS de la empresa en SGUEES
    2) PREVIEW  - Valida mapeo y cuadre cargo/abono vs CLASS
    3) MIGRAR   - Crea partida clase APE con saldos CLASS al fin de mes corte
    4) APLICAR  - Deja la partida en estado AP (opcional)
    5) Periodos - Cierra meses anteriores al de la partida; abre mes destino

  Requisitos:
    - Linked server CLASS_UEES -> 192.168.1.129 / CLASS_UEES (SETUP_SYS_INSTANCIA_REMOTA)
    - CON_CATALOGO_CUENTA importado (IMPORT_CLASS_WEB_CATALOGOS + FIX_CLASE_RUBRO)
    - Clase APE (SETUP_CON_CLASE_PARTIDA_APE)
    - PRAL_MIGR_CLASS_SALDO_INICIAL_BALANCE desplegado

  CLASS: solo SELECT via linked server. No modifica tablas en 129.

  Uso tipico (saldos al 31/07, partida apertura en agosto):
    -- 1) Revisar
    EXEC dbo.PRAL_MIGR_CLASS_APERTURA_COMPLETA
         @ANIO = 2025, @MES = 7, @MES_PARTIDA = 8, @MODO = 'PREVIEW';

    -- 2) Ejecutar limpieza + migracion + aplicar
    EXEC dbo.PRAL_MIGR_CLASS_APERTURA_COMPLETA
         @ANIO = 2025, @MES = 7, @MES_PARTIDA = 8, @MODO = 'EJECUTAR', @APLICAR = 1;

  Solo limpiar SGUEES (sin tocar CLASS):
    EXEC dbo.PRAL_MIGR_CLASS_APERTURA_COMPLETA @MODO = 'LIMPIAR';
================================================================================
*/
SET NOCOUNT ON;
GO

IF OBJECT_ID(N'dbo.PRAL_MIGR_CLASS_APERTURA_COMPLETA', N'P') IS NOT NULL
    DROP PROCEDURE dbo.PRAL_MIGR_CLASS_APERTURA_COMPLETA;
GO

CREATE PROCEDURE dbo.PRAL_MIGR_CLASS_APERTURA_COMPLETA
(
    @ANIO INT = 2025,
    @MES INT = 7,
    @MES_PARTIDA INT = NULL,
    @CIERRE INT = 0,
    @CORR_EMPRESA INT = 1,
    @MODO VARCHAR(10) = 'PREVIEW',          -- PREVIEW | EJECUTAR | LIMPIAR
    @APLICAR BIT = 1,
    @SYS_LOGIN_USUARIO VARCHAR(30) = 'MIGRACION',
    @SYS_ESTACION VARCHAR(50) = 'SQL',
    @CORR_PARTIDA INT = NULL OUTPUT,
    @SYS_FILAS_AFECTADAS INT = NULL OUTPUT,
    @SYS_NUMERO_ERROR NUMERIC(38, 0) = NULL OUTPUT,
    @SYS_MENSAJE_ERROR NVARCHAR(4000) = NULL OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT @SYS_NUMERO_ERROR = 0,
           @SYS_MENSAJE_ERROR = N'',
           @SYS_FILAS_AFECTADAS = 0,
           @CORR_PARTIDA = ISNULL(@CORR_PARTIDA, 0);

    DECLARE @MODO_U VARCHAR(10) = UPPER(LTRIM(RTRIM(ISNULL(@MODO, 'PREVIEW'))));
    DECLARE @MES_PARTIDA_EFF INT = ISNULL(@MES_PARTIDA, CASE WHEN @MES < 12 THEN @MES + 1 ELSE @MES END);
    DECLARE @FECHA_CORTE DATE = EOMONTH(DATEFROMPARTS(@ANIO, @MES, 1));
    DECLARE @FECHA_REPORTE DATE = EOMONTH(DATEFROMPARTS(@ANIO, @MES_PARTIDA_EFF, 1));
    DECLARE @FECHA DATETIME = GETDATE();
    DECLARE @E NUMERIC(38, 0);
    DECLARE @M NVARCHAR(4000);
    DECLARE @F INT;
    DECLARE @P INT;
    DECLARE @ANIO_P INT;
    DECLARE @MES_P INT;
    DECLARE @CLASE_P INT;
    DECLARE @PARTIDA_P INT;
    DECLARE @MES_IDX INT;

    IF @MES < 1 OR @MES > 12
    BEGIN
        SELECT @SYS_NUMERO_ERROR = 30101,
               @SYS_MENSAJE_ERROR = N'@MES debe estar entre 1 y 12.';
        GOTO FINA;
    END;

    IF @MES_PARTIDA_EFF < 1 OR @MES_PARTIDA_EFF > 12
    BEGIN
        SELECT @SYS_NUMERO_ERROR = 30102,
               @SYS_MENSAJE_ERROR = N'@MES_PARTIDA invalido.';
        GOTO FINA;
    END;

    IF NOT EXISTS (SELECT 1 FROM sys.servers WHERE name = N'CLASS_UEES')
    BEGIN
        SELECT @SYS_NUMERO_ERROR = 30103,
               @SYS_MENSAJE_ERROR = N'Linked server CLASS_UEES no existe. Ejecute SETUP_SYS_INSTANCIA_REMOTA.sql';
        GOTO FINA;
    END;

    IF OBJECT_ID(N'dbo.PRAL_MIGR_CLASS_SALDO_INICIAL_BALANCE', N'P') IS NULL
    BEGIN
        SELECT @SYS_NUMERO_ERROR = 30104,
               @SYS_MENSAJE_ERROR = N'Falta PRAL_MIGR_CLASS_SALDO_INICIAL_BALANCE. Ejecute MIGRATE_CLASS_SALDO_INICIAL_BALANCE_GENERAL.sql';
        GOTO FINA;
    END;

    -------------------------------------------------------------------------
    -- LIMPIAR movimiento contable en SGUEES (no toca CLASS)
    -------------------------------------------------------------------------
    IF @MODO_U IN ('LIMPIAR', 'EJECUTAR')
    BEGIN
        DECLARE curDesaplicar CURSOR LOCAL FAST_FORWARD FOR
            SELECT P.ANIO_PERIODO, P.MES_PERIODO, P.CORR_CLASE_PARTIDA, P.CORR_PARTIDA
            FROM CON_PARTIDA P
            WHERE P.CORR_EMPRESA = @CORR_EMPRESA
              AND P.ESTADO_PARTIDA = 'AP'
            ORDER BY P.ANIO_PERIODO, P.MES_PERIODO, P.CORR_PARTIDA;

        OPEN curDesaplicar;
        FETCH NEXT FROM curDesaplicar INTO @ANIO_P, @MES_P, @CLASE_P, @PARTIDA_P;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @P = @PARTIDA_P;
            EXEC dbo.PRAL_MTTO_CON_PARTIDA_DESAPLICAR
                @CORR_EMPRESA, @ANIO_P, @MES_P, @CLASE_P, @P OUTPUT,
                @SYS_LOGIN_USUARIO, @FECHA, @SYS_ESTACION,
                @SYS_LOGIN_USUARIO, @SYS_ESTACION,
                @F OUTPUT, @E OUTPUT, @M OUTPUT;

            IF ISNULL(@E, 0) <> 0
            BEGIN
                CLOSE curDesaplicar;
                DEALLOCATE curDesaplicar;
                SELECT @SYS_NUMERO_ERROR = @E,
                       @SYS_MENSAJE_ERROR = N'Error des-aplicando partida '
                           + CONVERT(VARCHAR(10), @ANIO_P) + N'/' + CONVERT(VARCHAR(2), @MES_P)
                           + N' #' + CONVERT(VARCHAR(10), @PARTIDA_P) + N': ' + ISNULL(@M, N'');
                GOTO FINA;
            END;

            FETCH NEXT FROM curDesaplicar INTO @ANIO_P, @MES_P, @CLASE_P, @PARTIDA_P;
        END;

        CLOSE curDesaplicar;
        DEALLOCATE curDesaplicar;

        IF OBJECT_ID(N'dbo.BAN_PARTIDA_DETA', N'U') IS NOT NULL
        BEGIN
            DELETE B
            FROM dbo.BAN_PARTIDA_DETA B
            INNER JOIN CON_PARTIDA_DETA D
                ON B.CORR_EMPRESA = D.CORR_EMPRESA
               AND B.ANIO_PERIODO = D.ANIO_PERIODO
               AND B.MES_PERIODO = D.MES_PERIODO
               AND B.CORR_CLASE_PARTIDA = D.CORR_CLASE_PARTIDA
               AND B.CORR_PARTIDA = D.CORR_PARTIDA
               AND B.CORR_PARTIDA_DETA = D.CORR_PARTIDA_DETA
            WHERE D.CORR_EMPRESA = @CORR_EMPRESA;
        END;

        DELETE D
        FROM CON_PARTIDA_DETA D
        INNER JOIN CON_PARTIDA P
            ON D.CORR_EMPRESA = P.CORR_EMPRESA
           AND D.ANIO_PERIODO = P.ANIO_PERIODO
           AND D.MES_PERIODO = P.MES_PERIODO
           AND D.CORR_CLASE_PARTIDA = P.CORR_CLASE_PARTIDA
           AND D.CORR_PARTIDA = P.CORR_PARTIDA
        WHERE P.CORR_EMPRESA = @CORR_EMPRESA;

        DELETE FROM CON_PARTIDA
        WHERE CORR_EMPRESA = @CORR_EMPRESA;

        DELETE FROM CON_CATALOGO_SALDO_HIS
        WHERE CORR_EMPRESA = @CORR_EMPRESA;

        SELECT @SYS_FILAS_AFECTADAS = @@ROWCOUNT,
               @SYS_MENSAJE_ERROR = N'SGUEES limpio: partidas, detalle y saldos historicos eliminados.';

        IF @MODO_U = 'LIMPIAR'
            GOTO FINA;
    END;

    IF @MODO_U = 'PREVIEW'
    BEGIN
        EXEC dbo.PRAL_MIGR_CLASS_SALDO_INICIAL_BALANCE
            @ANIO = @ANIO,
            @MES = @MES,
            @CIERRE = @CIERRE,
            @CORR_EMPRESA = @CORR_EMPRESA,
            @MODO = 'PREVIEW',
            @MES_PARTIDA = @MES_PARTIDA_EFF,
            @SYS_LOGIN_USUARIO = @SYS_LOGIN_USUARIO,
            @SYS_ESTACION = @SYS_ESTACION,
            @SYS_FILAS_AFECTADAS = @F OUTPUT,
            @SYS_NUMERO_ERROR = @E OUTPUT,
            @SYS_MENSAJE_ERROR = @M OUTPUT;

        SELECT @FECHA_CORTE AS FECHA_CORTE_CLASS,
               @MES_PARTIDA_EFF AS MES_PARTIDA_APE,
               N'Saldos leidos de CLASS_UEES (129). Sin cambios en CLASS.' AS NOTA;

        IF ISNULL(@E, 0) <> 0
        BEGIN
            SELECT @SYS_NUMERO_ERROR = @E, @SYS_MENSAJE_ERROR = @M;
        END;

        GOTO FINA;
    END;

    IF @MODO_U <> 'EJECUTAR'
    BEGIN
        SELECT @SYS_NUMERO_ERROR = 30105,
               @SYS_MENSAJE_ERROR = N'Modo invalido. Use PREVIEW, EJECUTAR o LIMPIAR.';
        GOTO FINA;
    END;

    -------------------------------------------------------------------------
    -- Periodos contables abiertos ANTES de crear/aplicar partida
    -------------------------------------------------------------------------
    SET @MES_IDX = 1;
    WHILE @MES_IDX <= 12
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM CON_PERIODO_CONTABLE
            WHERE CORR_EMPRESA = @CORR_EMPRESA AND ANIO_PERIODO = @ANIO AND MES_PERIODO = @MES_IDX
        )
        BEGIN
            INSERT INTO CON_PERIODO_CONTABLE (CORR_EMPRESA, ANIO_PERIODO, MES_PERIODO, ESTADO_PERIODO_CON)
            VALUES (
                @CORR_EMPRESA,
                @ANIO,
                @MES_IDX,
                CASE WHEN @MES_IDX < @MES_PARTIDA_EFF THEN 'CE' WHEN @MES_IDX = @MES_PARTIDA_EFF THEN 'AB' ELSE 'CE' END
            );
        END;

        SET @MES_IDX = @MES_IDX + 1;
    END;

    UPDATE CON_PERIODO_CONTABLE
    SET ESTADO_PERIODO_CON = CASE
            WHEN MES_PERIODO < @MES_PARTIDA_EFF THEN 'CE'
            WHEN MES_PERIODO = @MES_PARTIDA_EFF THEN 'AB'
            ELSE 'CE'
        END
    WHERE CORR_EMPRESA = @CORR_EMPRESA
      AND ANIO_PERIODO = @ANIO;

    -------------------------------------------------------------------------
    -- Crear partida APE (valida mapeo y cuadre internamente)
    -------------------------------------------------------------------------
    SET @P = NULL;
    EXEC dbo.PRAL_MIGR_CLASS_SALDO_INICIAL_BALANCE
        @ANIO = @ANIO,
        @MES = @MES,
        @CIERRE = @CIERRE,
        @CORR_EMPRESA = @CORR_EMPRESA,
        @MODO = 'MIGRAR',
        @MES_PARTIDA = @MES_PARTIDA_EFF,
        @CORR_PARTIDA = @P OUTPUT,
        @SYS_LOGIN_USUARIO = @SYS_LOGIN_USUARIO,
        @SYS_ESTACION = @SYS_ESTACION,
        @SYS_FILAS_AFECTADAS = @F OUTPUT,
        @SYS_NUMERO_ERROR = @E OUTPUT,
        @SYS_MENSAJE_ERROR = @M OUTPUT;

    IF ISNULL(@E, 0) <> 0
    BEGIN
        SELECT @SYS_NUMERO_ERROR = @E, @SYS_MENSAJE_ERROR = @M;
        GOTO FINA;
    END;

    SET @CORR_PARTIDA = @P;

    IF @APLICAR = 1
    BEGIN
        EXEC dbo.PRAL_MIGR_CLASS_SALDO_INICIAL_BALANCE
            @ANIO = @ANIO,
            @MES = @MES,
            @CORR_EMPRESA = @CORR_EMPRESA,
            @MODO = 'APLICAR',
            @MES_PARTIDA = @MES_PARTIDA_EFF,
            @CORR_PARTIDA = @P OUTPUT,
            @SYS_LOGIN_USUARIO = @SYS_LOGIN_USUARIO,
            @SYS_ESTACION = @SYS_ESTACION,
            @SYS_FILAS_AFECTADAS = @F OUTPUT,
            @SYS_NUMERO_ERROR = @E OUTPUT,
            @SYS_MENSAJE_ERROR = @M OUTPUT;

        IF ISNULL(@E, 0) <> 0
        BEGIN
            SELECT @SYS_NUMERO_ERROR = @E, @SYS_MENSAJE_ERROR = @M;
            GOTO FINA;
        END;

        SET @CORR_PARTIDA = @P;
    END;

    -------------------------------------------------------------------------
    -- Resumen final
    -------------------------------------------------------------------------
    SELECT @SYS_MENSAJE_ERROR = N'Apertura CLASS completada. CORR_PARTIDA='
        + CONVERT(VARCHAR(20), @CORR_PARTIDA)
        + N' | Corte CLASS: ' + CONVERT(VARCHAR(10), @FECHA_CORTE, 103)
        + N' | Periodo APE: ' + CONVERT(VARCHAR(2), @MES_PARTIDA_EFF) + N'/' + CONVERT(VARCHAR(4), @ANIO)
        + CASE WHEN @APLICAR = 1 THEN N' (AP)' ELSE N' (DI)' END;

    SELECT @CORR_PARTIDA AS CORR_PARTIDA,
           @FECHA_CORTE AS FECHA_CORTE_CLASS,
           @MES_PARTIDA_EFF AS MES_PARTIDA,
           @APLICAR AS APLICADA;

    SELECT SUM(D.MONTO_CARGO) AS TOTAL_CARGOS,
           SUM(D.MONTO_ABONO) AS TOTAL_ABONOS,
           SUM(D.MONTO_CARGO) - SUM(D.MONTO_ABONO) AS DIFERENCIA
    FROM CON_PARTIDA_DETA D
    INNER JOIN CON_PARTIDA P
        ON D.CORR_EMPRESA = P.CORR_EMPRESA
       AND D.ANIO_PERIODO = P.ANIO_PERIODO
       AND D.MES_PERIODO = P.MES_PERIODO
       AND D.CORR_CLASE_PARTIDA = P.CORR_CLASE_PARTIDA
       AND D.CORR_PARTIDA = P.CORR_PARTIDA
    INNER JOIN CON_CLASE_PARTIDA C
        ON P.CORR_EMPRESA = C.CORR_EMPRESA
       AND P.CORR_CLASE_PARTIDA = C.CORR_CLASE_PARTIDA
       AND C.NOMBRE_CORTO_CLASE = 'APE'
    WHERE P.CORR_EMPRESA = @CORR_EMPRESA
      AND P.ANIO_PERIODO = @ANIO
      AND P.MES_PERIODO = @MES_PARTIDA_EFF
      AND P.CORR_PARTIDA = @CORR_PARTIDA;

    SELECT 'Balance SGUEES post-apertura' AS REPORTE;
    EXEC dbo.PRAL_IMPR_BALANCE_GENERAL
        @CORR_EMPRESA = @CORR_EMPRESA,
        @FECHA_FINAL = @FECHA_REPORTE,
        @NIVEL = 3,
        @PARTIDA_CIERRE = 0,
        @PARTIDA_LIQUIDACION = 0;

    PRINT N'Compare totales con PREVIEW CLASS al ' + CONVERT(VARCHAR(10), @FECHA_CORTE, 103)
        + N': EXEC PRAL_MIGR_CLASS_SALDO_INICIAL_BALANCE @ANIO=' + CAST(@ANIO AS VARCHAR(4))
        + N', @MES=' + CAST(@MES AS VARCHAR(2)) + N', @MODO=''PREVIEW'';';

FINA:
    IF @MODO_U IN ('EJECUTAR', 'LIMPIAR') AND ISNULL(@SYS_NUMERO_ERROR, 0) <> 0
        SELECT @SYS_NUMERO_ERROR AS SYS_NUMERO_ERROR, @SYS_MENSAJE_ERROR AS SYS_MENSAJE_ERROR;
END;
GO

PRINT 'PRAL_MIGR_CLASS_APERTURA_COMPLETA creado.';
GO
