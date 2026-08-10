# Sincroniza reportes Crystal de Contabilidad desde e-Admin hacia SGUEES-RPT (patron Shop: carpeta por reporte).
# Omite libros de IVA (proyecto aparte).
param(
	[string]$Source = "C:\Users\jonathan.avalos\OneDrive - Universidad Evangélica de El Salvador\Documentos\jonathan\PROEYECTOS\e-Admin\e-Admin\Reportes\Contabilidad",
	[string]$DestRoot = "$PSScriptRoot\..\sguees-rpt\Reports\Accounting"
)

$folderMap = @{
	'BALANCE_COMPROBACION.rpt' = 'BALANCE_COMPROBACION\BALANCE_COMPROBACIONReport.rpt'
	'BALANCE_COMPROBACION_MES.rpt' = 'BALANCE_COMPROBACION_MES\BALANCE_COMPROBACION_MESReport.rpt'
	'BALANCE_GENERAL.rpt' = 'BALANCE_GENERAL\BALANCE_GENERALReport.rpt'
	'BALANCE_GENERAL_VERTICAL.rpt' = 'BALANCE_GENERAL_VERTICAL\BALANCE_GENERAL_VERTICALReport.rpt'
	'ESTADO_RESULTADOS.rpt' = 'ESTADO_RESULTADOS\ESTADO_RESULTADOSReport.rpt'
	'LIBRO_DIARIO_AUXILIAR.rpt' = 'LIBRO_DIARIO_AUXILIAR\LIBRO_DIARIO_AUXILIARReport.rpt'
	'LIBRO_DIARIO_AUXILIAR_MES.rpt' = 'LIBRO_DIARIO_AUXILIAR_MES\LIBRO_DIARIO_AUXILIAR_MESReport.rpt'
	'LIBRO_DIARIO_MAYOR.rpt' = 'LIBRO_DIARIO_MAYOR\LIBRO_DIARIO_MAYORReport.rpt'
	'CON_REPORTE_GASTOS.rpt' = 'CON_GASTOS\CON_REPORTE_GASTOSReport.rpt'
	'PARTIDA_CONTABLE.rpt' = 'CON_PARTIDA\PARTIDA_CONTABLEReport.rpt'
}

if (-not (Test-Path $Source)) {
	Write-Error "No se encontro la ruta origen: $Source"
	exit 1
}

New-Item -ItemType Directory -Force -Path $DestRoot | Out-Null

$copied = 0
$skipped = 0
Get-ChildItem -Path $Source -Filter "*.rpt" | ForEach-Object {
	if ($_.Name -like "LIBRO_IVA*") {
		$skipped++
		return
	}

	$relativeDest = $folderMap[$_.Name]
	if (-not $relativeDest) {
		$baseName = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
		$relativeDest = "$baseName\${baseName}Report.rpt"
	}

	$destPath = Join-Path $DestRoot $relativeDest
	New-Item -ItemType Directory -Force -Path (Split-Path $destPath) | Out-Null
	Copy-Item -Path $_.FullName -Destination $destPath -Force
	$copied++
}

Write-Host "Copiados: $copied | Omitidos IVA: $skipped | Destino: $DestRoot"
