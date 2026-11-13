param(
    [string]$Server = '192.168.0.250',
    [string]$Database = 'SGUEES',
    [string]$User = 'erp',
    [string]$Password = 'Uees$$2026'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$tables = @(
    'Tables\dbo.COM_PROVISION.sql',
    'Tables\dbo.COM_PROVISION_DETA.sql',
    'Tables\dbo.COM_PROVISION_CONTA.sql',
    'Tables\dbo.COM_PAGO.sql',
    'Tables\dbo.COM_PAGO_DETA.sql',
    'Tables\dbo.COM_PAGO_CONTA.sql',
    'Tables\dbo.COM_PAGO_ARCHIVO.sql'
)
$views = @(
    'Views\dbo.V_COM_PROVISION.sql',
    'Views\dbo.V_COM_PROVISION_DETA.sql',
    'Views\dbo.V_COM_PROVISION_CONTA.sql',
    'Views\dbo.V_COM_PROVISION_SELECCION.sql',
    'Views\dbo.V_COM_PROVISION_DESCRIPCION.sql',
    'Views\dbo.V_COM_DOCUMENTO_A_PROVISIONAR.sql',
    'Views\dbo.V_COM_PAGO.sql',
    'Views\dbo.V_COM_PAGO_DETA.sql',
    'Views\dbo.V_COM_PAGO_CONTA.sql',
    'Views\dbo.V_COM_PAGO_ARCHIVO.sql',
    'Views\dbo.V_COM_PAGO_SELECCION.sql',
    'Views\dbo.V_COM_PAGO_DOC.sql',
    'Views\dbo.V_COM_PAGO_A_PAGAR_ARCHIVO.sql',
    'Views\dbo.V_COM_PAGO_DESCRIPCION.sql'
)
$sps = @(
    'Stored Procedures\dbo.PRAL_DATA_COM_PROVISION.sql',
    'Stored Procedures\dbo.PRAL_DATA_COM_PROVISION_DETA.sql',
    'Stored Procedures\dbo.PRAL_DATA_COM_PROVISION_CONTA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PROVISION.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PROVISION_DETA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PROVISION_CONTA.sql',
    'Stored Procedures\dbo.PRAL_GENE_COM_PROVISION_CONTA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PROVISION_APLICAR.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PROVISION_ANULAR.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PROVISION_DESAPLICAR.sql',
    'Stored Procedures\dbo.PRAL_GENE_COM_ANULACION_PROVISION.sql',
    'Stored Procedures\dbo.PRAL_DATA_COM_PAGO.sql',
    'Stored Procedures\dbo.PRAL_DATA_COM_PAGO_DETA.sql',
    'Stored Procedures\dbo.PRAL_DATA_COM_PAGO_CONTA.sql',
    'Stored Procedures\dbo.PRAL_DATA_COM_PAGO_ARCHIVO.sql',
    'Stored Procedures\dbo.PRAL_DATA_COM_PAGO_DOC.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PAGO.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PAGO_DETA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PAGO_CONTA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PAGO_ARCHIVO.sql',
    'Stored Procedures\dbo.PRAL_GENE_COM_PAGO_CONTA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PAGO_APLICAR.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PAGO_DESAPLICAR.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PAGO_ACTUALIZAR_CUENTA.sql',
    'Stored Procedures\dbo.PRAL_MTTO_COM_PAGO_CORR_ARCHIVO.sql',
    'Stored Procedures\dbo.PRAL_GENE_COM_ANULACION_PAGO.sql',
    'Stored Procedures\dbo.PRAL_GENE_COM_PAGO_MOVI_BAN_ARCHIVO.sql',
    'Stored Procedures\dbo.PRAL_DATA_COM_PAGO_ARCHIVO_BANCO.sql'
)

function Invoke-SqlFile([string]$rel) {
    $path = Join-Path $root $rel
    if (-not (Test-Path $path)) { throw "Missing $path" }
    $name = [IO.Path]::GetFileNameWithoutExtension($rel) -replace '^dbo\.', ''
    $isView = $rel -like 'Views\*'
    $isSp = $rel -like 'Stored Procedures\*'
    $isTable = $rel -like 'Tables\*'
    $pathToRun = $path
    $tmp = $null

    if ($isTable) {
        $existsRaw = & sqlcmd -S $Server -d $Database -U $User -P $Password -h -1 -W -Q "SET NOCOUNT ON; SELECT CASE WHEN OBJECT_ID(N'dbo.$name', N'U') IS NULL THEN N'0' ELSE N'1' END"
        $exists = ("$existsRaw" -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -match '^[01]$' } | Select-Object -First 1)
        if ($exists -eq '1') {
            Write-Host "SKIP table $name (exists)" -ForegroundColor Yellow
            return
        }
    } elseif ($isView) {
        $tmp = [IO.Path]::GetTempFileName() + '.sql'
        $body = (Get-Content $path -Raw -Encoding UTF8) -replace '(?i)CREATE\s+VIEW', 'CREATE OR ALTER VIEW'
        Set-Content $tmp -Value $body -Encoding UTF8
        $pathToRun = $tmp
    } elseif ($isSp) {
        $tmp = [IO.Path]::GetTempFileName() + '.sql'
        $body = (Get-Content $path -Raw -Encoding UTF8) -replace '(?i)CREATE\s+PROCEDURE', 'CREATE OR ALTER PROCEDURE' -replace '(?i)CREATE\s+PROC\b', 'CREATE OR ALTER PROCEDURE'
        Set-Content $tmp -Value $body -Encoding UTF8
        $pathToRun = $tmp
    }

    Write-Host ">>> $rel" -ForegroundColor Cyan
    & sqlcmd -S $Server -d $Database -U $User -P $Password -f 65001 -b -i $pathToRun
    if ($LASTEXITCODE -ne 0) { throw "Failed $rel (exit $LASTEXITCODE)" }
    if ($tmp -and (Test-Path $tmp)) { Remove-Item $tmp -Force }
}

Write-Host "Deploy COM_PROVISION/COM_PAGO -> $Server/$Database" -ForegroundColor Green

# Recreate tablas (vacias) para aplicar DDL sin moneda/foranea
Write-Host ">>> Scripts\MIGRATE_DROP_RECREATE_COM_PROVISION_PAGO.sql" -ForegroundColor Cyan
& sqlcmd -S $Server -d $Database -U $User -P $Password -f 65001 -b -i (Join-Path $PSScriptRoot 'MIGRATE_DROP_RECREATE_COM_PROVISION_PAGO.sql')
if ($LASTEXITCODE -ne 0) { throw "Failed drop/recreate (exit $LASTEXITCODE)" }

Write-Host ">>> Scripts\PATCH_COM_PROVISION_PAGO_SCHEMA.sql" -ForegroundColor Cyan
& sqlcmd -S $Server -d $Database -U $User -P $Password -f 65001 -b -i (Join-Path $PSScriptRoot 'PATCH_COM_PROVISION_PAGO_SCHEMA.sql')
if ($LASTEXITCODE -ne 0) { throw "Failed schema patch (exit $LASTEXITCODE)" }

foreach ($f in $tables) { Invoke-SqlFile $f }
foreach ($f in $views) { Invoke-SqlFile $f }
foreach ($f in $sps) { Invoke-SqlFile $f }
Write-Host "OK deploy" -ForegroundColor Green
