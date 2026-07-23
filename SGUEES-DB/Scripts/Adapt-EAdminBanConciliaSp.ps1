param(
    [string]$SourceDir = "C:\Users\jonathan.avalos\Documents\proyecto para ERP\e-admin\e-Admin.db",
    [string]$DestSpDir = "C:\Desarrollo GIT\SGUEES\SGUEES-DB\Stored Procedures",
    [string]$DestViewDir = "C:\Desarrollo GIT\SGUEES\SGUEES-DB\Views"
)

function Adapt-SgueesBanConciliaSql {
    param([string]$Content)

    $c = $Content

    # Parametros / columnas suscripcion-pais
    $c = $c -replace '(?m)^\s*@CORR_SUSCRIPCION\s+int(?:=NULL)?,\s*\r?\n', ''
    $c = $c -replace '(?m)^\s*@CORR_CONFI_PAIS\s+int(?:=NULL)?,\s*\r?\n', ''
    $c = $c -replace '(?m)^\s*CORR_SUSCRIPCION int,\s*\r?\n', ''
    $c = $c -replace '(?m)^\s*CORR_CONFI_PAIS int,\s*\r?\n', ''

    # Joins suscripcion+pais+empresa -> empresa (alias cualquiera)
    $c = $c -replace '\w+\.CORR_SUSCRIPCION\s*=\s*\w+\.CORR_SUSCRIPCION\s+AND\s+\w+\.CORR_CONFI_PAIS\s*=\s*\w+\.CORR_CONFI_PAIS\s+AND\s+', ''

    # WHERE / AND filtros suscripcion-pais
    $c = $c -replace 'WHERE CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_EMPRESA=@CORR_EMPRESA', 'WHERE CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'WHERE A\.CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND A\.CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND A\.CORR_EMPRESA=@CORR_EMPRESA', 'WHERE A.CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'AND CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_EMPRESA=@CORR_EMPRESA', 'AND CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'AND A\.CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND A\.CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND A\.CORR_EMPRESA=@CORR_EMPRESA', 'AND A.CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'WHERE\s+A\.CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s*\r?\n\s*AND A\.CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s*\r?\n', "WHERE`r`n"
    $c = $c -replace 'AND A\.CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s*\r?\n\s*AND A\.CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s*\r?\n', ''

    # EXEC internos
    $c = $c -replace 'EXEC PRAL_DATA_BAN_CONCILIA_BANCARIA_PENDIENTE\s+1,\s*@CORR_SUSCRIPCION,\s*@CORR_CONFI_PAIS,\s*@CORR_EMPRESA,', 'EXEC PRAL_DATA_BAN_CONCILIA_BANCARIA_PENDIENTE 1, @CORR_EMPRESA,'
    $c = $c -replace 'EXEC PRAL_MTTO_ADMIN_BITACORA_SISTEMA 1,@CORR_SUSCRIPCION,@CORR_CONFI_PAIS,@CORR_BITACORA', 'EXEC PRAL_MTTO_ADMIN_BITACORA_SISTEMA 1,@CORR_BITACORA'

    # INSERT / VALUES / SELECT listas columnas
    $c = $c -replace '\(CORR_SUSCRIPCION,CORR_CONFI_PAIS,CORR_EMPRESA,', '(CORR_EMPRESA,'
    $c = $c -replace '\(@CORR_SUSCRIPCION,@CORR_CONFI_PAIS,@CORR_EMPRESA,', '(@CORR_EMPRESA,'
    $c = $c -replace 'SELECT @CORR_SUSCRIPCION,@CORR_CONFI_PAIS,@CORR_EMPRESA,', 'SELECT @CORR_EMPRESA,'
    $c = $c -replace 'SELECT TOP 1 @CORR_SUSCRIPCION,@CORR_CONFI_PAIS,@CORR_EMPRESA,', 'SELECT TOP 1 @CORR_EMPRESA,'

    # Tablas @TEMP / PK
    $c = $c -replace '(?m)^\s*CORR_SUSCRIPCION int,\s*\r?\n\s*CORR_CONFI_PAIS int,\s*\r?\n', ''
    $c = $c -replace 'PRIMARY KEY\(CORR_SUSCRIPCION,CORR_CONFI_PAIS,CORR_EMPRESA,', 'PRIMARY KEY(CORR_EMPRESA,'
    $c = $c -replace 'PRIMARY KEY\(\s*CORR_SUSCRIPCION,\s*\r?\n\s*CORR_CONFI_PAIS,\s*\r?\n\s*CORR_EMPRESA,', 'PRIMARY KEY(CORR_EMPRESA,'

    # SELECT listas (vistas / SP) — quitar suscripcion/pais al inicio
    $c = $c -replace '(?m)^\s*SELECT\s+,(\w+\.)?CORR_EMPRESA', 'SELECT $1CORR_EMPRESA'
    $c = $c -replace '(?m)^\s*,?\s*(\w+\.)?CORR_SUSCRIPCION\s*\r?\n\s*,?\s*(\w+\.)?CORR_CONFI_PAIS\s*\r?\n', ''
    $c = $c -replace '(?m)^\s*SELECT A\.CORR_SUSCRIPCION\s*\r?\n\s*,A\.CORR_CONFI_PAIS\s*\r?\n', 'SELECT '
    $c = $c -replace '(?m)^\s*SELECT B\.CORR_SUSCRIPCION\s*\r?\n\s*,\s*B\.CORR_CONFI_PAIS\s*\r?\n', 'SELECT '
    $c = $c -replace 'SELECT A\.CORR_SUSCRIPCION, A\.CORR_CONFI_PAIS, A\.CORR_EMPRESA,', 'SELECT A.CORR_EMPRESA,'
    $c = $c -replace 'SELECT\s+,', 'SELECT '

    # INSERT column lists multilinea
    $c = $c -replace '(?m)^\s*CORR_SUSCRIPCION\s*,\s*\r?\n\s*CORR_CONFI_PAIS\s*,\s*\r?\n\s*CORR_EMPRESA\s*,', 'CORR_EMPRESA,'

    # GROUP BY restante
    $c = $c -replace 'GROUP BY A\.CORR_SUSCRIPCION\s*\r?\n\s*,A\.CORR_CONFI_PAIS\s*\r?\n\s*,A\.CORR_EMPRESA', 'GROUP BY A.CORR_EMPRESA'
    $c = $c -replace 'PARTITION BY A\.CORR_SUSCRIPCION,A\.CORR_CONFI_PAIS,A\.CORR_EMPRESA', 'PARTITION BY A.CORR_EMPRESA'

    # EXEC MTTO deta / revertir — quitar suscripcion del inicio
    $c = $c -replace '(?m)^(\s*EXEC PRAL_MTTO_BAN_CONCILIA_BANCARIA_DETA\s*\r?\n\s*1,\s*\r?\n)\s*@CORR_SUSCRIPCION,\s*\r?\n\s*@CORR_CONFI_PAIS,\s*\r?\n', '$1'
    $c = $c -replace '(?m)^(\s*EXEC PRAL_GENE_BAN_CONCILIACION_REVERTIR\s*\r?\n)\s*@CORR_SUSCRIPCION,\s*\r?\n\s*@CORR_CONFI_PAIS,\s*\r?\n', '$1'

    # BAN_BANCO -> GEN_BANCO (SGUEES)
    $c = $c -replace 'FROM BAN_BANCO\s+WHERE CORR_EMPRESA=@CORR_EMPRESA', 'FROM GEN_BANCO WHERE CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'FROM BAN_BANCO\s+WHERE CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_BANCO=@CORR_BANCO', 'FROM GEN_BANCO WHERE CORR_EMPRESA=@CORR_EMPRESA AND CORR_BANCO=@CORR_BANCO'

    # Impresion encabezado empresa (segundo resultset)
    $c = $c -replace '(?m)^\s*SELECT A\.CORR_SUSCRIPCION\s*\r?\n\s*,A\.CORR_CONFI_PAIS\s*\r?\n\s*,A\.CORR_EMPRESA\s*\r?\n\s*,A\.NOMBRE_EMPRESA', "SELECT A.CORR_EMPRESA`r`n`t,A.NOMBRE_EMPRESA"

    # GROUP BY / PARTITION / ORDER BY
    $c = $c -replace 'GROUP BY A\.CORR_SUSCRIPCION,A\.CORR_CONFI_PAIS,A\.CORR_EMPRESA', 'GROUP BY A.CORR_EMPRESA'
    $c = $c -replace 'GROUP BY A\.CORR_SUSCRIPCION, A\.CORR_CONFI_PAIS, A\.CORR_EMPRESA', 'GROUP BY A.CORR_EMPRESA'
    $c = $c -replace 'PARTITION BY A\.CORR_SUSCRIPCION, A\.CORR_CONFI_PAIS, A\.CORR_EMPRESA', 'PARTITION BY A.CORR_EMPRESA'
    $c = $c -replace 'ORDER BY A\.CORR_SUSCRIPCION,A\.CORR_CONFI_PAIS,A\.CORR_EMPRESA,', 'ORDER BY A.CORR_EMPRESA,'
    $c = $c -replace 'ROW_NUMBER\(\) OVER\(ORDER BY A\.CORR_SUSCRIPCION,A\.CORR_CONFI_PAIS,A\.CORR_EMPRESA,', 'ROW_NUMBER() OVER(ORDER BY A.CORR_EMPRESA,'

    # Moneda empresa desde CON_PARAMETRO
    $c = $c -replace '(?s)SELECT @CORR_MONEDA_EMPRESA=CORR_MONEDA\s+FROM GEN_EMPRESA\s+WHERE CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_EMPRESA=@CORR_EMPRESA', 'SELECT @CORR_MONEDA_EMPRESA=CORR_MONEDA FROM CON_PARAMETRO WHERE CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace '(?s)SELECT @CORR_MONEDA_EMPRESA=CORR_MONEDA\s+FROM GEN_EMPRESA\s+WHERE CORR_EMPRESA=@CORR_EMPRESA', 'SELECT @CORR_MONEDA_EMPRESA=CORR_MONEDA FROM CON_PARAMETRO WHERE CORR_EMPRESA=@CORR_EMPRESA'

    # Impresion encabezado empresa
    $c = $c -replace '(?s)SELECT A\.CORR_SUSCRIPCION\s*,A\.CORR_CONFI_PAIS\s*,A\.CORR_EMPRESA\s*,CASE WHEN @COUNT=1 THEN A\.NOMBRE_EMPRESA ELSE B\.NOMBRE_GRUPO END NOMBRE_EMPRESA\s*,.*?FROM GEN_EMPRESA A\s*INNER JOIN GEN_GRUPO_EMPRESA B.*?WHERE\s+A\.CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s*AND A\.CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s*AND A\.CORR_EMPRESA=@CORR_EMPRESA',
        "SELECT A.CORR_EMPRESA`r`n`t,A.NOMBRE_EMPRESA`r`n`t,'' PERIODO`r`n`t,LOGO_1 LOGO1`r`n`t,LOGO_2 LOGO2`r`n`t,'' TITULO_REPORTE`r`n`t,'' NOMBRE_SISTEMA`r`n`t,GETDATE() FECHA_IMPRESION`r`n`tFROM GEN_EMPRESA A`r`n`tWHERE A.CORR_EMPRESA=@CORR_EMPRESA"

    return $c
}

$viewFiles = @(
    'Views\dbo.V_BAN_CONCILIA_BANCARIA.sql',
    'Views\dbo.V_BAN_CONCILIA_BANCARIA_DETA.sql',
    'Views\dbo.V_BAN_CONCILIA_BANCARIA_MOVI.sql',
    'Views\dbo.V_BAN_CONCILIA_BANCARIA_MOVI_SUM.sql',
    'Views\dbo.V_BAN_CONCILIA_BANCARIA_IMPRIME.sql',
    'Views\dbo.V_BAN_CONCILIA_PENDIENTE.sql'
)

$spFiles = @(
    'Stored Procedures\dbo.PRAL_DATA_BAN_CONCILIA_BANCARIA.sql',
    'Stored Procedures\dbo.PRAL_DATA_BAN_CONCILIA_BANCARIA_DETA.sql',
    'Stored Procedures\dbo.PRAL_DATA_BAN_CONCILIA_BANCARIA_MOVI.sql',
    'Stored Procedures\dbo.PRAL_DATA_BAN_CONCILIA_BANCARIA_PENDIENTE.sql',
    'Stored Procedures\dbo.PRAL_DATA_BAN_CONCILIA_BANCARIA_RESUMEN.sql',
    'Stored Procedures\dbo.PRAL_GENE_BAN_CONCILIACION_BANCARIA.sql',
    'Stored Procedures\dbo.PRAL_GENE_BAN_CONCILIACION_BANCARIA_MOVI.sql',
    'Stored Procedures\dbo.PRAL_GENE_BAN_CONCILIACION_FORZADA.sql',
    'Stored Procedures\dbo.PRAL_GENE_BAN_CONCILIACION_REVERTIR.sql',
    'Stored Procedures\dbo.PRAL_GENE_BAN_CONCILIA_BANCARIA_MOV_EXCEL.sql',
    'Stored Procedures\dbo.PRAL_IMPR_BAN_CONCILIA_BANCARIA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_BAN_CONCILIA_BANCARIA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_BAN_CONCILIA_BANCARIA_APLICAR.sql',
    'Stored Procedures\dbo.PRAL_MTTO_BAN_CONCILIA_BANCARIA_DESAPLICAR.sql',
    'Stored Procedures\dbo.PRAL_MTTO_BAN_CONCILIA_BANCARIA_DETA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_BAN_CONCILIA_BANCARIA_MARCAR.sql',
    'Stored Procedures\dbo.PRAL_MTTO_BAN_CONCILIA_BANCARIA_MOVI.sql'
)

foreach ($rel in $viewFiles) {
    $src = Join-Path $SourceDir $rel
    $name = Split-Path $rel -Leaf
    $dst = Join-Path $DestViewDir $name
    if (-not (Test-Path -LiteralPath $src)) {
        Write-Warning "No encontrado: $src"
        continue
    }
    $raw = Get-Content -LiteralPath $src -Raw -Encoding UTF8
    $adapted = Adapt-SgueesBanConciliaSql -Content $raw
    Set-Content -LiteralPath $dst -Value $adapted -Encoding UTF8
    Write-Host "Vista adaptada: $name"
}

foreach ($rel in $spFiles) {
    $src = Join-Path $SourceDir $rel
    $name = Split-Path $rel -Leaf
    $dst = Join-Path $DestSpDir $name
    if (-not (Test-Path -LiteralPath $src)) {
        Write-Warning "No encontrado: $src"
        continue
    }
    $raw = Get-Content -LiteralPath $src -Raw -Encoding UTF8
    $adapted = Adapt-SgueesBanConciliaSql -Content $raw
    Set-Content -LiteralPath $dst -Value $adapted -Encoding UTF8
    Write-Host "SP adaptado: $name"
}

Write-Host 'Adaptacion BAN conciliacion completada.'
