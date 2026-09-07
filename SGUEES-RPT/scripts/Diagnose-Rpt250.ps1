# Ejecutar EN EL SERVIDOR 250 (PowerShell como Administrador)
param(
	[string]$SitePath = 'C:\inetpub\wwwroot\sguees-rpt',
	[string]$AppPool = 'DefaultAppPool',
	[string]$SiteUrl = 'http://localhost/sguees-rpt/'
)

$ErrorActionPreference = 'Continue'
Write-Host '=== Diagnostico sguees-rpt ===' -ForegroundColor Cyan

Write-Host "`n--- Archivos ---"
$required = @(
	'Global.asax',
	'Web.config',
	'bin\sgueesRpt.dll',
	'bin\CrystalDecisions.CrystalReports.Engine.dll',
	'bin\System.Web.Http.dll'
)
foreach ($rel in $required) {
	$full = Join-Path $SitePath $rel
	if (Test-Path $full) {
		$item = Get-Item $full
		Write-Host "  OK  $rel ($([math]::Round($item.Length/1KB, 1)) KB)" -ForegroundColor Green
	} else {
		Write-Host "  FALTA  $rel" -ForegroundColor Red
	}
}

$globalAsax = Join-Path $SitePath 'Global.asax'
if (Test-Path $globalAsax) {
	$content = Get-Content $globalAsax -Raw
	if ($content -match 'Codebehind=') {
		Write-Host '  AVISO: Global.asax tiene Codebehind= — en IIS debe quitarse (solo Inherits=)' -ForegroundColor Yellow
		Write-Host '         <%@ Application Inherits="sgueesRpt.WebApiApplication" Language="C#" %>'
	}
}

Write-Host "`n--- ASP.NET / IIS ---"
$aspNetReg = "${env:WINDIR}\Microsoft.NET\Framework64\v4.0.30319\aspnet_regiis.exe"
if (Test-Path $aspNetReg) {
	& $aspNetReg -ir 2>&1 | Out-String | Write-Host
} else {
	Write-Host '  No se encontro aspnet_regiis (instalar .NET Framework 4.8)' -ForegroundColor Red
}

$appcmd = "${env:windir}\system32\inetsrv\appcmd.exe"
if (Test-Path $appcmd) {
	Write-Host '  Application pool:'
	& $appcmd list apppool $AppPool /text:* 2>$null
}

Write-Host "`n--- Crystal runtime (registro) ---"
$crystalKeys = @(
	'HKLM:\SOFTWARE\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Crystal Reports',
	'HKLM:\SOFTWARE\WOW6432Node\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Crystal Reports'
)
$foundCrystal = $false
foreach ($key in $crystalKeys) {
	if (Test-Path $key) {
		$foundCrystal = $true
		Get-ItemProperty $key -ErrorAction SilentlyContinue | Format-List
	}
}
if (-not $foundCrystal) {
	Write-Host '  No se detecto Crystal en registro. Instale CRRuntime_64bit_13_0_32.msi (SP32).' -ForegroundColor Yellow
}

Write-Host "`n--- Event Log (ultimos errores ASP.NET / IIS) ---"
Get-WinEvent -FilterHashtable @{
	LogName = 'Application'
	Level = 2, 3
	StartTime = (Get-Date).AddHours(-2)
} -MaxEvents 15 -ErrorAction SilentlyContinue |
	Where-Object { $_.ProviderName -match 'ASP\.NET|IIS|\.NET Runtime' } |
	ForEach-Object {
		Write-Host "  [$($_.TimeCreated)] $($_.ProviderName): $($_.Message.Split("`n")[0])" -ForegroundColor DarkYellow
	}

Write-Host "`n--- HTTP local ---"
$probeUrls = @(
	($SiteUrl + 'ping.html'),
	($SiteUrl + 'test.aspx'),
	($SiteUrl + 'api/Login/EchoPing')
)
foreach ($u in $probeUrls) {
	try {
		$r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 15
		Write-Host "  $u -> $($r.StatusCode)" -ForegroundColor Green
	} catch {
		$code = $_.Exception.Response.StatusCode.value__
		Write-Host "  $u -> HTTP $code" -ForegroundColor Red
	}
}

Write-Host "`n--- Acciones sugeridas ---"
Write-Host '  1) Quitar Codebehind de Global.asax si aparece arriba'
Write-Host '  2) Roles Windows: IIS + ASP.NET 4.8 activados'
Write-Host '  3) Pool .NET CLR v4.0, Integrado; Enable 32-Bit = False si instalo runtime x64'
Write-Host '  4) iisreset'
Write-Host '  5) Republicar: .\Publish-Test250.ps1 desde PC de desarrollo'
