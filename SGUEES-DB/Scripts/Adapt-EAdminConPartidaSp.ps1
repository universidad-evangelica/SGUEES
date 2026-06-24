param(
    [string]$SourceDir = "C:\Users\jonathan.avalos\OneDrive - Universidad Evangélica de El Salvador\Documentos\jonathan\PROEYECTOS\e-Admin\e-Admin.db\Stored Procedures",
    [string]$DestDir = "c:\Desarrollo GIT\SGUEES\SGUEES-DB\Stored Procedures"
)

function Adapt-SgueesPartidaSp {
    param([string]$Content)

    $c = $Content

    # Base e-Admin -> SGUEES (subset from Adapt-EAdminConReportSp.ps1)
    $c = $c -replace '(?m)^\s*@CORR_SUSCRIPCION\s+int,\s*\r?\n', ''
    $c = $c -replace '(?m)^\s*@CORR_CONFI_PAIS\s+int,\s*\r?\n', ''
    $c = $c -replace '(?m)^\s*CORR_SUSCRIPCION int,\s*\r?\n', ''
    $c = $c -replace '(?m)^\s*CORR_CONFI_PAIS int,\s*\r?\n', ''
    $c = $c -replace 'A\.CORR_SUSCRIPCION=B\.CORR_SUSCRIPCION AND A\.CORR_CONFI_PAIS=B\.CORR_CONFI_PAIS AND A\.CORR_EMPRESA=B\.CORR_EMPRESA', 'A.CORR_EMPRESA=B.CORR_EMPRESA'
    $c = $c -replace 'WHERE CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_EMPRESA=@CORR_EMPRESA', 'WHERE CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'AND CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_EMPRESA=@CORR_EMPRESA', 'AND CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'WHERE A\.CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND A\.CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND A\.CORR_EMPRESA=@CORR_EMPRESA', 'WHERE A.CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'AND A\.CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND A\.CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND A\.CORR_EMPRESA=@CORR_EMPRESA', 'AND A.CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace '(?m)^\s*@CORR_SUSCRIPCION,\s*\r?\n\s*@CORR_CONFI_PAIS,\s*\r?\n\s*@CORR_EMPRESA,', '		@CORR_EMPRESA,'

    # Tablas @SALDO sin suscripcion
    $c = $c -replace '(?m)^\s*CORR_SUSCRIPCION int,\s*\r?\n\s*CORR_CONFI_PAIS int,\s*\r?\n', ''
    $c = $c -replace 'PRIMARY KEY\(\s*CORR_SUSCRIPCION,\s*\r?\n\s*CORR_CONFI_PAIS,\s*\r?\n\s*CORR_EMPRESA,', 'PRIMARY KEY( CORR_EMPRESA,'

    # GEN_PARAMETRO / bimoneda -> desactivado en SGUEES
    $c = $c -replace '(?s)SELECT @ES_BIMONEDA=ES_BIMONEDA, @CORR_MONEDA_INTER=CORR_MONEDA_INTER\s+FROM GEN_PARAMETRO\s+WHERE CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_EMPRESA=@CORR_EMPRESA', 'SELECT @ES_BIMONEDA=0, @CORR_MONEDA_INTER=NULL'
    $c = $c -replace '(?s)SELECT @ES_BIMONEDA=ES_BIMONEDA, @CORR_MONEDA_INTER=CORR_MONEDA_INTER\s+FROM GEN_PARAMETRO\s+WHERE CORR_EMPRESA=@CORR_EMPRESA', 'SELECT @ES_BIMONEDA=0, @CORR_MONEDA_INTER=NULL'

    # Moneda local desde CON_PARAMETRO
    $c = $c -replace '(?s)SELECT TOP 1 @CORR_MONEDA=A\.CORR_MONEDA\s+FROM GEN_EMPRESA A\s+WHERE A\.CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND A\.CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND A\.CORR_EMPRESA=@CORR_EMPRESA', 'SELECT TOP 1 @CORR_MONEDA=A.CORR_MONEDA FROM CON_PARAMETRO A WHERE A.CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace '(?s)SELECT TOP 1 @CORR_MONEDA=A\.CORR_MONEDA\s+FROM GEN_EMPRESA A\s+WHERE A\.CORR_EMPRESA=@CORR_EMPRESA', 'SELECT TOP 1 @CORR_MONEDA=A.CORR_MONEDA FROM CON_PARAMETRO A WHERE A.CORR_EMPRESA=@CORR_EMPRESA'

    # Bitacora SGUEES (sin suscripcion)
    $c = $c -replace 'EXEC PRAL_MTTO_ADMIN_BITACORA_SISTEMA 1,@CORR_SUSCRIPCION,@CORR_CONFI_PAIS,@CORR_BITACORA output', 'EXEC PRAL_MTTO_ADMIN_BITACORA_SISTEMA 1,@CORR_BITACORA output'

    # EXEC MTTO partida / deta - quitar suscripcion del inicio
    $c = $c -replace '(?m)^(\s*EXEC PRAL_MTTO_CON_PARTIDA\s*\r?\n\s*1,--@TIPO_ACTUALIZA INT,\s*\r?\n)\s*@CORR_SUSCRIPCION,\s*\r?\n\s*@CORR_CONFI_PAIS,\s*\r?\n', '$1		'
    $c = $c -replace '(?m)^(\s*EXEC PRAL_MTTO_CON_PARTIDA\s*\r?\n\s*1,--@TIPO_ACTUALIZA INT,\s*\r?\n)\s*@CORR_SUSCRIPCION,\s*\r?\n\s*@CORR_CONFI_PAIS,\s*\r?\n', '$1		'
    $c = $c -replace '(?m)^(\s*EXEC PRAL_MTTO_CON_PARTIDA_DETA\s*\r?\n\s*1 --@TIPO_ACTUALIZA\s*\r?\n)\s*, @CORR_SUSCRIPCION\s*\r?\n\s*, @CORR_CONFI_PAIS\s*\r?\n', '$1					'
    $c = $c -replace '(?m)^(\s*EXEC PRAL_MTTO_CON_PARTIDA_DETA\s*\r?\n\s*1 --@TIPO_ACTUALIZA\s*\r?\n)\s*, @CORR_SUSCRIPCION\s*\r?\n\s*, @CORR_CONFI_PAIS\s*\r?\n', '$1					'

    # ROW_NUMBER order
    $c = $c -replace 'ROW_NUMBER\(\) OVER\(ORDER BY ISNULL\(A\.CORR_SUSCRIPCION,B\.CORR_SUSCRIPCION\),ISNULL\(A\.CORR_CONFI_PAIS,B\.CORR_CONFI_PAIS\),ISNULL\(A\.CORR_EMPRESA,B\.CORR_EMPRESA\)\)', 'ROW_NUMBER() OVER(ORDER BY ISNULL(A.CORR_EMPRESA,B.CORR_EMPRESA))'

    # CON_PARAMETRO perdida/ganancia filtro empresa
    $c = $c -replace 'FROM CON_PARAMETRO A\s*$', 'FROM CON_PARAMETRO A WHERE A.CORR_EMPRESA=@CORR_EMPRESA'

    return $c
}

$files = @(
    'dbo.PRAL_MTTO_CON_PARTIDA.sql',
    'dbo.PRAL_MTTO_CON_PARTIDA_DETA.sql',
    'dbo.PRAL_GENE_PARTIDA_CIERRE.sql',
    'dbo.PRAL_GENE_PARTIDA_APERTURA.sql',
    'dbo.PRAL_GENE_PARTIDA_LIQUIDACION.sql'
)

foreach ($f in $files) {
    $src = Join-Path $SourceDir $f
    $dst = Join-Path $DestDir $f
    if (-not (Test-Path $src)) {
        Write-Warning "No encontrado: $src"
        continue
    }
    $raw = Get-Content $src -Raw -Encoding UTF8
    $adapted = Adapt-SgueesPartidaSp -Content $raw
    Set-Content -Path $dst -Value $adapted -Encoding UTF8
    Write-Host "Adaptado: $f"
}

Write-Host "Listo. Revise EXEC PRAL_MTTO_* y joins restantes."
