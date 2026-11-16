param(
    [string]$Server = '192.168.0.250',
    [string]$Database = 'SGUEES',
    [string]$User = 'erp',
    [string]$Password = 'Uees$$2026'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$rel = 'Stored Procedures\dbo.PRAL_DATA_COM_PAGO_ARCHIVO_BANCO.sql'
$path = Join-Path $root $rel
$tmp = [IO.Path]::GetTempFileName() + '.sql'
$body = (Get-Content $path -Raw -Encoding UTF8) -replace '(?i)CREATE\s+PROCEDURE', 'CREATE OR ALTER PROCEDURE'
Set-Content $tmp -Value $body -Encoding UTF8
Write-Host ">>> $rel" -ForegroundColor Cyan
& sqlcmd -S $Server -d $Database -U $User -P $Password -f 65001 -b -i $tmp
if ($LASTEXITCODE -ne 0) { Remove-Item $tmp -Force; throw "Failed $rel (exit $LASTEXITCODE)" }
Remove-Item $tmp -Force

Write-Host "Verify no moneda/foranea columns..." -ForegroundColor Cyan
& sqlcmd -S $Server -d $Database -U $User -P $Password -f 65001 -h -1 -W -Q "SET NOCOUNT ON; SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME IN (N'COM_PROVISION',N'COM_PAGO',N'COM_PROVISION_CONTA',N'COM_PAGO_CONTA') AND COLUMN_NAME IN (N'CORR_MONEDA',N'FACTOR_CAMBIO',N'OPERADOR',N'MONTO_CARGO_FORANEA',N'MONTO_ABONO_FORANEA'); SELECT name FROM sys.procedures WHERE name LIKE N'PRAL_%COM_PROVISION%' OR name LIKE N'PRAL_%COM_PAGO%' ORDER BY name;"
Write-Host "OK" -ForegroundColor Green
