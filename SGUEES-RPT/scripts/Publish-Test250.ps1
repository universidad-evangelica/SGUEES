param(
	[string]$Server = '192.168.0.250',
	[string]$RptDest = '\\192.168.0.250\c$\inetpub\wwwroot\sguees-rpt',
	[string]$ApiRptUrl = 'http://192.168.0.250/sguees-rpt/api/',
	[switch]$LocalOnly
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$projectDir = Join-Path $repoRoot 'sguees-rpt'
$projectFile = Join-Path $projectDir 'sguees-rpt.csproj'
$publishDir = Join-Path $repoRoot 'publish'

function Find-MsBuild {
	$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
	if (Test-Path $vswhere) {
		$msbuild = & $vswhere -latest -requires Microsoft.Component.MSBuild -find 'MSBuild\**\Bin\MSBuild.exe' | Select-Object -First 1
		if ($msbuild) { return $msbuild }
	}
	$fallback = @(
		"${env:ProgramFiles}\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe",
		"${env:ProgramFiles}\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe",
		"${env:ProgramFiles}\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe",
		"${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\Enterprise\MSBuild\Current\Bin\MSBuild.exe"
	)
	foreach ($path in $fallback) {
		if (Test-Path $path) { return $path }
	}
	throw 'No se encontro MSBuild. Instale Visual Studio Build Tools o abra Developer PowerShell.'
}

function Set-RptJwtConfig {
	param([string]$WebConfigPath, [string]$AudienceIssuer)

	[xml]$xml = Get-Content -LiteralPath $WebConfigPath -Encoding UTF8
	foreach ($key in @('JWT_AUDIENCE_TOKEN', 'JWT_ISSUER_TOKEN')) {
		$node = $xml.configuration.appSettings.add | Where-Object { $_.key -eq $key }
		if (-not $node) { throw "Falta appSetting $key en $WebConfigPath" }
		$node.value = $AudienceIssuer
	}
	$xml.Save($WebConfigPath)
}

function Set-RptIisDeployConfig {
	param([string]$WebConfigPath)

	[xml]$xml = Get-Content -LiteralPath $WebConfigPath -Encoding UTF8
	$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
	$sysWeb = $xml.configuration.SelectSingleNode('system.web')
	if (-not $sysWeb) { throw 'Falta system.web en Web.config' }

	$compilation = $sysWeb.SelectSingleNode('compilation')
	if ($compilation) {
		$compilation.SetAttribute('debug', 'false') | Out-Null
	}

	$customErrors = $sysWeb.SelectSingleNode('customErrors')
	if (-not $customErrors) {
		$customErrors = $xml.CreateElement('customErrors')
		$customErrors.SetAttribute('mode', 'Off') | Out-Null
		$null = $sysWeb.PrependChild($customErrors)
	} else {
		$customErrors.SetAttribute('mode', 'Off') | Out-Null
	}

	$webServer = $xml.SelectSingleNode('configuration/location/system.webServer')
	if ($webServer -and -not $webServer.SelectSingleNode('httpErrors')) {
		$httpErrors = $xml.CreateElement('httpErrors')
		$httpErrors.SetAttribute('errorMode', 'Detailed') | Out-Null
		$httpErrors.SetAttribute('existingResponse', 'PassThrough') | Out-Null
		$null = $webServer.AppendChild($httpErrors)
	}

	$xml.Save($WebConfigPath)
}

function Set-RptGlobalAsaxDeploy {
	param([string]$GlobalAsaxPath)

	$content = '<%@ Application Inherits="sgueesRpt.WebApiApplication" Language="C#" %>'
	Set-Content -LiteralPath $GlobalAsaxPath -Value $content -Encoding UTF8 -NoNewline
}

Write-Host '=== RPT (Crystal) ===' -ForegroundColor Cyan

if (-not (Test-Path $projectFile)) {
	throw "No se encontro el proyecto: $projectFile"
}

$msbuild = Find-MsBuild
Write-Host "MSBuild: $msbuild"

& $msbuild $projectFile /t:Rebuild /p:Configuration=Release /p:Platform=AnyCPU /verbosity:minimal
if ($LASTEXITCODE -ne 0) { throw 'Fallo build RPT' }

$releaseBin = Join-Path $projectDir 'bin'
if (-not (Test-Path (Join-Path $releaseBin 'sgueesRpt.dll'))) {
	throw 'Build incompleto: falta sguees-rpt\bin\sgueesRpt.dll'
}

if (Test-Path $publishDir) { Remove-Item $publishDir -Recurse -Force }
New-Item -ItemType Directory -Path $publishDir | Out-Null
Copy-Item (Join-Path $projectDir 'Global.asax') $publishDir -Force
Copy-Item (Join-Path $projectDir 'Web.config') $publishDir -Force
Copy-Item (Join-Path $projectDir 'ping.html') $publishDir -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $projectDir 'test.aspx') $publishDir -Force -ErrorAction SilentlyContinue
Copy-Item $releaseBin (Join-Path $publishDir 'bin') -Recurse -Force

$webConfig = Join-Path $publishDir 'Web.config'
Set-RptJwtConfig -WebConfigPath $webConfig -AudienceIssuer $ApiRptUrl
Set-RptIisDeployConfig -WebConfigPath $webConfig
Set-RptGlobalAsaxDeploy -GlobalAsaxPath (Join-Path $publishDir 'Global.asax')
Write-Host "JWT audience/issuer -> $ApiRptUrl" -ForegroundColor Green
Write-Host 'Global.asax sin Codebehind (deploy IIS)' -ForegroundColor Green

Write-Host "Paquete listo en $publishDir" -ForegroundColor Green

if ($LocalOnly) {
	Write-Host 'Modo LocalOnly: copie manualmente la carpeta publish al servidor.' -ForegroundColor Yellow
	return
}

try {
	if (-not (Test-Path $RptDest)) {
		New-Item -ItemType Directory -Path $RptDest -Force | Out-Null
	}
	Copy-Item (Join-Path $publishDir '*') $RptDest -Recurse -Force
	Write-Host "RPT publicada en $RptDest" -ForegroundColor Green
} catch {
	Write-Host "No se pudo copiar a $RptDest : $($_.Exception.Message)" -ForegroundColor Red
	Write-Host "Copie manualmente: $publishDir -> C:\inetpub\wwwroot\sguees-rpt" -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Verificar en el servidor 250:' -ForegroundColor Yellow
Write-Host '  1) IIS: aplicacion sguees-rpt, pool .NET CLR v4.0 (Integrado), ej. DefaultAppPool o SGUEES-RPT'
Write-Host '  2) Crystal Reports runtime 13.0 SP32 (x64) instalado en el servidor'
Write-Host '  3) API appsettings.json: AppSetting:apiRptURL = ' + $ApiRptUrl
Write-Host '  4) Reciclar pool sguees-rpt y probar:'
Write-Host "     http://$Server/sguees-rpt/api/  (401 sin token = OK; 500 = revisar runtime IIS)"
Write-Host ''
Write-Host 'Script de prueba E2E:' -ForegroundColor Cyan
Write-Host '  .\SGUEES-DB\Scripts\test-con-reporte-pdf.ps1 -ApiUrl http://192.168.0.250/sgueesAPI/ -Login admin -Password ... -CodigoReporte BALANCE_GENERAL'
