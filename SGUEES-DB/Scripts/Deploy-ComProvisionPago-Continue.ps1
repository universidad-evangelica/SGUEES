param(
    [string]$Server = '192.168.0.250',
    [string]$Database = 'SGUEES',
    [string]$User = 'erp',
    [string]$Password = 'Uees$$2026'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent

Write-Host ">>> Scripts\PATCH_COM_PROVISION_PAGO_SCHEMA.sql" -ForegroundColor Cyan
& sqlcmd -S $Server -d $Database -U $User -P $Password -f 65001 -b -i (Join-Path $PSScriptRoot 'PATCH_COM_PROVISION_PAGO_SCHEMA.sql')
if ($LASTEXITCODE -ne 0) { throw "Failed schema patch (exit $LASTEXITCODE)" }

$sps = @(
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

foreach ($rel in $sps) {
    $path = Join-Path $root $rel
    if (-not (Test-Path $path)) { throw "Missing $path" }
    $tmp = [IO.Path]::GetTempFileName() + '.sql'
    $body = (Get-Content $path -Raw -Encoding UTF8) -replace '(?i)CREATE\s+PROCEDURE', 'CREATE OR ALTER PROCEDURE' -replace '(?i)CREATE\s+PROC\b', 'CREATE OR ALTER PROCEDURE'
    Set-Content $tmp -Value $body -Encoding UTF8
    Write-Host ">>> $rel" -ForegroundColor Cyan
    & sqlcmd -S $Server -d $Database -U $User -P $Password -f 65001 -b -i $tmp
    if ($LASTEXITCODE -ne 0) { Remove-Item $tmp -Force; throw "Failed $rel (exit $LASTEXITCODE)" }
    Remove-Item $tmp -Force
}

Write-Host "OK remaining SPs" -ForegroundColor Green

