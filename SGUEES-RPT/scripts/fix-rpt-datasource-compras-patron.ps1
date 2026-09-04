# Actualiza datasources .rpt al patron Compras (sgueesRpt.Models / *_IMPRView).
param(
	[switch]$Apply,
	[switch]$DryRun
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$engine = 'C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win32_x86\dotnet\CrystalDecisions.CrystalReports.Engine.dll'
$shared = 'C:\Program Files (x86)\SAP BusinessObjects\Crystal Reports for .NET Framework 4.0\Common\SAP BusinessObjects Enterprise XI 4.0\win32_x86\dotnet\CrystalDecisions.Shared.dll'
$csc = 'C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe'

if (-not (Test-Path $engine)) {
	Write-Error 'No se encontro Crystal Reports SDK. Instale SAP Crystal Reports runtime for .NET.'
	exit 1
}

$exe = Join-Path $scriptDir 'FixRptDatasource.exe'
& $csc /nologo /platform:x86 /out:$exe (Join-Path $scriptDir 'FixRptDatasource.cs') /r:$engine /r:$shared
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$args = @()
if ($Apply) { $args += '--apply' } else { $args += '--dry-run' }
& $exe @args
exit $LASTEXITCODE
