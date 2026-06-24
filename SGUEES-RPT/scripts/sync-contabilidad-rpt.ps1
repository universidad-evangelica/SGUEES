# Sincroniza reportes Crystal de Contabilidad desde e-Admin hacia SGUEES-RPT.
# Omite libros de IVA (proyecto aparte).
param(
	[string]$Source = "C:\Users\jonathan.avalos\OneDrive - Universidad Evangélica de El Salvador\Documentos\jonathan\PROEYECTOS\e-Admin\e-Admin\Reportes\Contabilidad",
	[string]$Dest = "$PSScriptRoot\..\sguees-rpt\Reports\Accounting"
)

if (-not (Test-Path $Source)) {
	Write-Error "No se encontro la ruta origen: $Source"
	exit 1
}

New-Item -ItemType Directory -Force -Path $Dest | Out-Null

$copied = 0
$skipped = 0
Get-ChildItem -Path $Source -Filter "*.rpt" | ForEach-Object {
	if ($_.Name -like "LIBRO_IVA*") {
		$skipped++
		return
	}
	Copy-Item -Path $_.FullName -Destination (Join-Path $Dest $_.Name) -Force
	$copied++
}

Write-Host "Copiados: $copied | Omitidos IVA: $skipped | Destino: $Dest"
