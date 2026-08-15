/*
  Orquestador migración Compras CSUEES (129/SUEES) -> SGUEES (250).
  Solo lectura en 129. Escritura en 250.

  Uso:
    cd "C:\Desarrollo GIT\SGUEES\SGUEES-DB\Scripts"
    powershell -File RUN_MIGRATE_COMPRAS_FROM_129.ps1
*/
param(
    [string]$Server = '192.168.0.250',
    [string]$Database = 'SGUEES',
    [string]$User = 'erp',
    [string]$Password = 'Uees$$2026'
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Invoke-SgueesSql {
    param([string]$ScriptPath)
    Write-Host ">> $([System.IO.Path]::GetFileName($ScriptPath))"
    & sqlcmd -S $Server -U $User -P $Password -d $Database -f 65001 -b -i $ScriptPath
    if ($LASTEXITCODE -ne 0) { throw "Fallo: $ScriptPath" }
}

Write-Host '=== 1/5 Linked server SUEES129 ==='
Invoke-SgueesSql (Join-Path $scriptDir 'ADD_SUEES129_INSTANCIA_REMOTA.sql')

Write-Host '=== 2/5 Preparar esquema ==='
Invoke-SgueesSql (Join-Path $scriptDir 'PREP_MIGRATE_COM_FROM_SUEES_129.sql')

Write-Host '=== 3/5 SP proveedor (CSUEES) ==='
& sqlcmd -S $Server -U $User -P $Password -d $Database -f 65001 -b -Q "IF OBJECT_ID(N'dbo.PRAL_MTTO_COM_PROVEEDOR', N'P') IS NOT NULL DROP PROCEDURE dbo.PRAL_MTTO_COM_PROVEEDOR;"
& sqlcmd -S $Server -U $User -P $Password -d $Database -f 65001 -b -i "C:\Desarrollo GIT\SGUEES\SGUEES-DB\Stored Procedures\dbo.PRAL_MTTO_COM_PROVEEDOR.sql"

Write-Host '=== 4/5 Migrar datos COM_* ==='
Invoke-SgueesSql (Join-Path $scriptDir 'MIGRATE_COM_DATA_FROM_SUEES_129.sql')

Write-Host '=== 5/5 Deploy vistas Compras linked ==='
if (Test-Path (Join-Path $scriptDir 'DEPLOY_COMPRAS_LINKED_129.sql')) {
    Invoke-SgueesSql (Join-Path $scriptDir 'DEPLOY_COMPRAS_LINKED_129.sql')
}

Write-Host '=== Migración Compras completada ==='
