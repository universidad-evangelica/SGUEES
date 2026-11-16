param(
    [string]$Server = '192.168.0.250',
    [string]$Database = 'SGUEES',
    [string]$User = 'erp',
    [string]$Password = 'Uees$$2026'
)
$ErrorActionPreference = 'Stop'
$path = Join-Path $PSScriptRoot 'MENU_COM_PROVISION_PAGO.sql'
Write-Host ">>> MENU_COM_PROVISION_PAGO.sql" -ForegroundColor Cyan
& sqlcmd -S $Server -d $Database -U $User -P $Password -f 65001 -b -W -i $path
if ($LASTEXITCODE -ne 0) { throw "Failed menu script (exit $LASTEXITCODE)" }
Write-Host "OK menu" -ForegroundColor Green
