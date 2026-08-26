/*
  Despliegue + ejecucion: partida de apertura CLASS al 31 de julio.

  Origen: CLASS_UEES en 192.168.1.129 (solo lectura via linked server).
  Destino: SGUEES en 192.168.0.250.

  Parametros sqlcmd (ajuste el anio si corresponde):
    ANIO=2025   -- anio del corte 31/jul
    MES=7       -- mes corte (julio)
    MES_PARTIDA=8  -- mes donde queda la partida APE (agosto); omitir = MES+1
    MODO=PREVIEW|EJECUTAR
    APLICAR=1

  Ejemplos:
    cd "C:\Desarrollo GIT\SGUEES\SGUEES-DB\Scripts"

    -- Solo desplegar SPs (sin ejecutar migracion)
    sqlcmd -S 192.168.0.250 -U erp -d SGUEES -i DEPLOY_MIGR_CLASS_APERTURA.sql

    -- Preview (no borra nada)
    sqlcmd -S 192.168.0.250 -U erp -d SGUEES -v ANIO=2025 -v MES=7 -v MES_PARTIDA=8 -v MODO=PREVIEW -i RUN_MIGR_CLASS_APERTURA_31JUL.sql

    -- Ejecutar completo: limpia SGUEES + crea y aplica APE
    sqlcmd -S 192.168.0.250 -U erp -d SGUEES -v ANIO=2025 -v MES=7 -v MES_PARTIDA=8 -v MODO=EJECUTAR -v APLICAR=1 -i RUN_MIGR_CLASS_APERTURA_31JUL.sql
*/
SET NOCOUNT ON;
GO

:r DEPLOY_MIGR_CLASS_APERTURA.sql
GO

DECLARE @ANIO INT = TRY_CONVERT(INT, '$(ANIO)');
DECLARE @MES INT = TRY_CONVERT(INT, '$(MES)');
DECLARE @MES_PARTIDA INT = TRY_CONVERT(INT, '$(MES_PARTIDA)');
DECLARE @MODO VARCHAR(10) = NULLIF(LTRIM(RTRIM('$(MODO)')), '');
DECLARE @APLICAR INT = TRY_CONVERT(INT, '$(APLICAR)');
DECLARE @E NUMERIC(38, 0);
DECLARE @M NVARCHAR(4000);
DECLARE @F INT;
DECLARE @P INT;

IF @ANIO IS NULL SET @ANIO = 2025;
IF @MES IS NULL SET @MES = 7;
IF @MES_PARTIDA IS NULL OR @MES_PARTIDA = 0 SET @MES_PARTIDA = CASE WHEN @MES < 12 THEN @MES + 1 ELSE @MES END;
IF @MODO IS NULL SET @MODO = 'PREVIEW';
IF @APLICAR IS NULL SET @APLICAR = 1;

PRINT '=== PRAL_MIGR_CLASS_APERTURA_COMPLETA ===';
PRINT 'Corte CLASS: ' + CONVERT(VARCHAR(10), EOMONTH(DATEFROMPARTS(@ANIO, @MES, 1)), 103);
PRINT 'Mes partida APE: ' + CAST(@MES_PARTIDA AS VARCHAR(2)) + '/' + CAST(@ANIO AS VARCHAR(4));
PRINT 'Modo: ' + @MODO;

EXEC dbo.PRAL_MIGR_CLASS_APERTURA_COMPLETA
    @ANIO = @ANIO,
    @MES = @MES,
    @MES_PARTIDA = @MES_PARTIDA,
    @CIERRE = 0,
    @CORR_EMPRESA = 1,
    @MODO = @MODO,
    @APLICAR = @APLICAR,
    @CORR_PARTIDA = @P OUTPUT,
    @SYS_NUMERO_ERROR = @E OUTPUT,
    @SYS_MENSAJE_ERROR = @M OUTPUT,
    @SYS_FILAS_AFECTADAS = @F OUTPUT;

IF ISNULL(@E, 0) <> 0
BEGIN
    RAISERROR(N'Error: %s', 16, 1, @M);
    RETURN;
END;

PRINT ISNULL(@M, N'OK');
GO
