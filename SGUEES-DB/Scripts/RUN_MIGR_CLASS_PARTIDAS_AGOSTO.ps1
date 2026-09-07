param(
	[string]$Server = '192.168.0.250',
	[string]$Database = 'SGUEES',
	[string]$User = 'erp',
	[string]$Password = '',
	[int]$Anio = 2026,
	[int]$Mes = 8,
	[ValidateSet('PREVIEW', 'EJECUTAR')]
	[string]$Modo = 'PREVIEW',
	[int]$Aplicar = 1
)

$ErrorActionPreference = 'Stop'
$scriptDir = $PSScriptRoot
$sqlFile = Join-Path $scriptDir 'RUN_MIGR_CLASS_PARTIDAS_AGOSTO.sql'

if (-not (Test-Path $sqlFile)) {
	throw "No se encontro $sqlFile"
}

if ([string]::IsNullOrWhiteSpace($Password)) {
	$appsettingsPath = Join-Path (Split-Path (Split-Path $scriptDir -Parent) -Parent) 'SGUEES-API\sguees.api\appsettings.json'
	if (Test-Path $appsettingsPath) {
		$cs = (Get-Content $appsettingsPath -Raw | ConvertFrom-Json).connectionStrings.defaultConnection
		$cs -split ';' | ForEach-Object {
			if ($_ -match '^pwd=(.*)$') { $Password = $matches[1] }
		}
	}
}
if ([string]::IsNullOrWhiteSpace($Password)) {
	$secure = Read-Host 'Clave SQL' -AsSecureString
	$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
	$Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
}

Write-Host "=== Partidas CLASS mes $Mes/$Anio -> SGUEES ($Modo) ===" -ForegroundColor Cyan

$scriptDirResolved = (Resolve-Path $scriptDir).Path
Set-Location $scriptDirResolved
$prev = $env:SQLCMDPASSWORD
$env:SQLCMDPASSWORD = $Password
try {
	sqlcmd -S $Server -U $User -d $Database -f 65001 `
		-v ANIO=$Anio -v MES=$Mes -v MODO=$Modo -v APLICAR=$Aplicar `
		-i 'RUN_MIGR_CLASS_PARTIDAS_AGOSTO.sql'
	if ($LASTEXITCODE -ne 0) { throw 'sqlcmd fallo' }
}
finally {
	if ($null -eq $prev) { Remove-Item Env:SQLCMDPASSWORD -ErrorAction SilentlyContinue }
	else { $env:SQLCMDPASSWORD = $prev }
}

Write-Host 'Listo.' -ForegroundColor Green
