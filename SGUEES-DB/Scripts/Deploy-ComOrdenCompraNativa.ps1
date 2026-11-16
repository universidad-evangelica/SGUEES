param(
    [string]$Server = '192.168.0.250',
    [string]$Database = 'SGUEES',
    [string]$User = 'erp',
    [string]$Password = 'Uees$$2026'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent

function Invoke-SqlFile([string]$rel, [switch]$AsAlter) {
    $path = Join-Path $root $rel
    if (-not (Test-Path $path)) { throw "Missing $path" }
    $tmp = $null
    $pathToRun = $path
    if ($AsAlter) {
        $tmp = [IO.Path]::GetTempFileName() + '.sql'
        $body = Get-Content $path -Raw -Encoding UTF8
        $body = $body -replace '(?i)CREATE\s+VIEW', 'CREATE OR ALTER VIEW'
        $body = $body -replace '(?i)CREATE\s+PROCEDURE', 'CREATE OR ALTER PROCEDURE'
        $body = $body -replace '(?i)CREATE\s+PROC\b', 'CREATE OR ALTER PROCEDURE'
        Set-Content $tmp -Value $body -Encoding UTF8
        $pathToRun = $tmp
    }
    Write-Host ">>> $rel" -ForegroundColor Cyan
    & sqlcmd -S $Server -d $Database -U $User -P $Password -f 65001 -b -i $pathToRun
    if ($LASTEXITCODE -ne 0) {
        if ($tmp) { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
        throw "Failed $rel (exit $LASTEXITCODE)"
    }
    if ($tmp) { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
}

Write-Host "Deploy COM_ORDEN_COMPRA nativa -> $Server/$Database" -ForegroundColor Green

# Recrear tablas vacías al schema SGUEES (sin suscripción/país; con ANIO_PERIODO + CODIGO_ITEM)
Invoke-SqlFile 'Scripts\MIGRATE_DROP_RECREATE_COM_ORDEN_COMPRA.sql'
Invoke-SqlFile 'Scripts\PATCH_COM_CUADRO_COMPARATIVO_ORDEN_COMPRA_CORR_OC.sql'

$views = @(
    'Views\dbo.V_COM_ORDEN_COMPRA_TOTALES.sql',
    'Views\dbo.V_COM_ORDEN_COMPRA_DETA.sql',
    'Views\dbo.V_COM_ORDEN_COMPRA.sql',
    'Views\dbo.V_COM_CUADRO_COMPARATIVO_ORDEN_COMPRA.sql'
)
foreach ($v in $views) { Invoke-SqlFile $v -AsAlter }

$sps = @(
    'Stored Procedures\dbo.PRAL_DATA_COM_ORDEN_COMPRA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_ORDEN_COMPRA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_ORDEN_COMPRA_DETA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_ORDEN_COMPRA_APLICAR.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_ORDEN_COMPRA_ANULAR.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_ORDEN_COMPRA_DESAPLICAR.sql',
    'Stored Procedures\dbo.PRAL_GENE_COM_ORDEN_COMPRA.sql'
)
foreach ($sp in $sps) { Invoke-SqlFile $sp -AsAlter }

Write-Host "OK COM_ORDEN_COMPRA nativa desplegada" -ForegroundColor Green
& sqlcmd -S $Server -d $Database -U $User -P $Password -h -1 -W -Q "SET NOCOUNT ON; SELECT name FROM sys.tables WHERE name IN (N'COM_ORDEN_COMPRA',N'COM_ORDEN_COMPRA_DETA'); SELECT COL_LENGTH(N'dbo.COM_CUADRO_COMPARATIVO_ORDEN_COMPRA', N'CORR_ORDEN_COMPRA'); SELECT name FROM sys.procedures WHERE name LIKE N'PRAL_%COM_ORDEN_COMPRA%' ORDER BY name;"
