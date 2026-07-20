# Reorganiza Reports/Banking/*.rpt al patron Shop (carpeta por reporte).
param(
	[string]$BankingRoot = "$PSScriptRoot\..\sguees-rpt\Reports\Banking"
)

$moves = @{
	'BAN_CHEQUE_EMITIDOSReport.rpt' = 'BAN_CHEQUE_EMITIDOS\BAN_CHEQUE_EMITIDOSReport.rpt'
	'BAN_ESTADO_CUENTAReport.rpt' = 'BAN_ESTADO_CUENTA\BAN_ESTADO_CUENTAReport.rpt'
	'BAN_ESTADO_CUENTA_ACUMULADOReport.rpt' = 'BAN_ESTADO_CUENTA_ACUMULADO\BAN_ESTADO_CUENTA_ACUMULADOReport.rpt'
	'BAN_ENTREGA_CHEQUESReport.rpt' = 'BAN_ENTREGA_CHEQUES\BAN_ENTREGA_CHEQUESReport.rpt'
}

$moved = 0
foreach ($entry in $moves.GetEnumerator()) {
	$src = Join-Path $BankingRoot $entry.Key
	$dest = Join-Path $BankingRoot $entry.Value
	if (-not (Test-Path $src)) {
		continue
	}
	New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
	if (-not (Test-Path $dest)) {
		Move-Item -Force $src $dest
		Write-Host "Movido $($entry.Key) -> $($entry.Value)"
		$moved++
	}
}

Write-Host "Reorganizados: $moved | Raiz: $BankingRoot"
