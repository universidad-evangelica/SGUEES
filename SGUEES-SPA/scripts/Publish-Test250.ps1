param(
	[string]$Server = '192.168.0.250',
	[string]$SpaDest = '\\192.168.0.250\c$\inetpub\wwwroot\sguees',
	[string]$ApiDest = '\\192.168.0.250\c$\inetpub\wwwroot\sgueesAPI',
	[switch]$SpaOnly,
	[switch]$ApiOnly,
	[switch]$RptOnly,
	[switch]$IncludeRpt
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$repoRoot = Split-Path $root -Parent
$spaRoot = $root
$apiRoot = Join-Path $repoRoot 'SGUEES-API\sguees.api'

function Publish-Spa {
	Write-Host '=== SPA ===' -ForegroundColor Cyan
	$imgPath = Join-Path $spaRoot 'src\assets\img\Login_Portal_2.jpg'
	if (-not (Test-Path $imgPath)) {
		Write-Warning "Falta imagen de fondo: $imgPath"
		Write-Warning 'Copie Login_Portal_2.jpg y logo-xx.png a src\assets\img\ antes de publicar.'
	}

	Set-Location $spaRoot
	npm run build:iis
	if ($LASTEXITCODE -ne 0) { throw 'Fallo build SPA' }

	if (-not (Test-Path (Join-Path $spaRoot 'build\index.html'))) {
		throw 'No se genero build\index.html'
	}

	Copy-Item (Join-Path $spaRoot 'build\*') $SpaDest -Recurse -Force
	Write-Host "SPA publicada en $SpaDest" -ForegroundColor Green
}

function Publish-Api {
	Write-Host '=== API ===' -ForegroundColor Cyan
	Set-Location $apiRoot
	dotnet publish -c Release -o .\publish
	if ($LASTEXITCODE -ne 0) { throw 'Fallo publish API' }

	Copy-Item (Join-Path $apiRoot 'publish\*') $ApiDest -Recurse -Force
	Copy-Item (Join-Path $apiRoot 'web.config') (Join-Path $ApiDest 'web.config') -Force
	Write-Host "API publicada en $ApiDest" -ForegroundColor Green
	Write-Host 'Revise appsettings.json en el servidor (AllowedOrigins, clientURL).' -ForegroundColor Yellow
}

function Publish-Rpt {
	$rptScript = Join-Path $repoRoot 'SGUEES-RPT\scripts\Publish-Test250.ps1'
	if (-not (Test-Path $rptScript)) {
		throw "No se encontro $rptScript"
	}
	& $rptScript -Server $Server
}

if ($RptOnly) {
	Publish-Rpt
}
else {
	if (-not $ApiOnly) { Publish-Spa }
	if (-not $SpaOnly) { Publish-Api }
	if ($IncludeRpt) { Publish-Rpt }
}

Write-Host ''
Write-Host "Probar:" -ForegroundColor Cyan
Write-Host "  SPA:  http://$Server/sguees/"
Write-Host "  Ruta: http://$Server/sguees/login-form"
Write-Host "  API:  http://$Server/sgueesAPI/SEG_USUARIO/login"
Write-Host "  RPT:  http://$Server/sguees-rpt/api/  (401 sin token = servicio arriba)"
Write-Host ''
Write-Host 'Reportes: republicar RPT con JWT correcto:' -ForegroundColor Yellow
Write-Host '  .\SGUEES-RPT\scripts\Publish-Test250.ps1'
Write-Host '  o: .\SGUEES-SPA\scripts\Publish-Test250.ps1 -IncludeRpt'
